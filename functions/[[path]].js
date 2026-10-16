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
export async function onRequest(context) {
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
