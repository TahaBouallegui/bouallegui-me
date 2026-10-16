// Pages Functions catch-all: serves the repo's static assets with their exact
// paths, so /blog.html answers 200 instead of the 308 to /blog that Pages'
// built-in pretty links would issue. The two index collapses that used to live
// in _redirects are done here, because _redirects does not apply to requests
// a Function answers.
//
// ASSETS.fetch applies the same pretty links to its own request, so asking it
// for /blog.html gets the 308 back. Asking for /blog gets the file at 200,
// which is what this returns at the .html URL. The page's canonical, the
// sitemap and every internal link stay on the .html form, so the extensionless
// duplicate that stays reachable is the one that gets consolidated away.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname === "/index.html") {
    return Response.redirect(url.origin + "/", 301);
  }
  if (url.pathname === "/fr/index.html") {
    return Response.redirect(url.origin + "/fr/", 301);
  }
  if (url.pathname.endsWith(".html")) {
    const bare = new URL(url.pathname.slice(0, -5), url);
    const served = await context.env.ASSETS.fetch(new Request(bare, context.request));
    if (served.status === 200) {
      return served;
    }
  }
  return context.env.ASSETS.fetch(context.request);
}
