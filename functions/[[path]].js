// Pages Functions catch-all: serves the repo's static assets with their exact
// paths, so /blog.html answers 200 instead of the 308 to /blog that Pages'
// built-in pretty links would issue. ASSETS.fetch applies the same pretty links
// to its own request, so asking it for /blog.html gets the 308 back; asking for
// /blog gets the file at 200, which is what this returns at the .html URL. The
// page's canonical, the sitemap and every internal link stay on the .html form,
// so the extensionless duplicate that stays reachable is the one that gets
// consolidated away.
//
// The two index collapses stay in _redirects, which is evaluated before this
// Function runs, so those paths never reach here.
//
// The User-Agent gate below answers obvious HTTP client libraries and scraper
// bots with a 403 before any asset is served. Browsers, feed readers, search
// engines, link preview bots and the Internet Archive all send a UA of their
// own and pass. This is a speed bump, not a wall: anyone willing to forge a UA
// walks straight through it, and that is the point, it stops the lazy majority
// that does not bother. Keep the list lowercase, it is matched as a lowercase
// substring. An absent UA is blocked too, no browser omits one.
const BLOCKED_UA = [
  "python-requests",
  "python-urllib",
  "httpx",
  "aiohttp",
  "go-http-client",
  "okhttp",
  "java/",
  "curl/",
  "wget/",
  "libwww-perl",
  "node-fetch",
  "axios",
  "scrapy",
  "feign",
  "postmanruntime",
  "headlesschrome",
  "phantomjs",
  "selenium",
];

function blocked(ua) {
  if (ua === null) {
    return true;
  }
  const low = ua.toLowerCase();
  return BLOCKED_UA.some((needle) => low.includes(needle));
}

export async function onRequest(context) {
  if (blocked(context.request.headers.get("User-Agent"))) {
    return new Response("Forbidden", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const url = new URL(context.request.url);
  if (url.pathname.endsWith(".html")) {
    const bare = new URL(url.pathname.slice(0, -5), url);
    const served = await context.env.ASSETS.fetch(new Request(bare, context.request));
    if (served.status === 200) {
      return served;
    }
  }
  return context.env.ASSETS.fetch(context.request);
}
