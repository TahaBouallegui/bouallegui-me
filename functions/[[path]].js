// Pages Functions catch-all: serves the repo's static assets with their exact
// paths, so /blog.html answers 200 instead of the 308 to /blog that Pages'
// built-in pretty links would issue. The two index collapses that used to live
// in _redirects are done here, because _redirects does not apply to requests
// a Function answers.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname === "/index.html") {
    return Response.redirect(url.origin + "/", 301);
  }
  if (url.pathname === "/fr/index.html") {
    return Response.redirect(url.origin + "/fr/", 301);
  }
  return context.env.ASSETS.fetch(context.request);
}
