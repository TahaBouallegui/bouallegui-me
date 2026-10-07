// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// Browser-faithful asset check: `make crawl`.
//
// scripts/check-links.sh reads the source and proves every written reference points at a file
// that exists. This one goes the other way: it serves the repo over HTTP and requests each
// reference the way a browser would, so a relative path that is right on disk but wrong from
// the page's own URL (posts/*.html and fr/*.html are one level down) shows up as a 404.
// Stylesheet url() values resolve against the stylesheet, not the page, and that is checked too.
// It also checks that the nav of a French page stays inside /fr/, which no amount of link checking
// catches, because the English page it points at exists.
//
// Exits non-zero if anything 404s, so CI can gate on it.

import { createServer } from 'node:http';
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? new URL('.', import.meta.url).pathname.replace(/scripts\/$/, ''));
const PORT = Number(process.argv[3] || 8123);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.ico': 'image/x-icon',
};

const srv = createServer((req, res) => {
  const p = decodeURIComponent((req.url || '/').split('?')[0]);
  // A directory URL means its index page, the way a static host resolves one. The sitemap lists
  // / and /fr/, and the nav links ./ and ../, so those must answer 200 here as they do on the host.
  const f = normalize(join(ROOT, p.endsWith('/') ? p + 'index.html' : p));
  if (!f.startsWith(ROOT) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404).end('404'); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream' });
  createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(PORT, r));

const pages = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')).map((f) => '/' + f),
  ...readdirSync(join(ROOT, 'fr')).filter((f) => f.endsWith('.html')).map((f) => '/fr/' + f),
  ...readdirSync(join(ROOT, 'posts')).filter((f) => f.endsWith('.html')).map((f) => '/posts/' + f),
];

let bad = 0, checked = 0, misplaced = 0;
for (const page of pages) {
  const url = `http://127.0.0.1:${PORT}${page}`;
  const html = await (await fetch(url)).text();

  // The nav is stamped from one template, so a French page can end up sending its reader to the
  // English portfolio: the reference resolves, returns 200, and only the language is wrong. A link
  // check cannot see that, so compare each nav target against the page's own language. The
  // language switch carries hreflang and is meant to cross, so it is left alone.
  const nav = (html.match(/<nav[\s\S]*?<\/nav>/) || [''])[0];
  const wantFr = page.startsWith('/fr/');
  for (const m of nav.matchAll(/<a\b([^>]*)>/g)) {
    const attrs = m[1];
    if (/hreflang=/.test(attrs)) continue;
    const href = (attrs.match(/href="([^"]*)"/) || [])[1];
    if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const path = new URL(href, url).pathname;
    if (path.startsWith('/fr/') !== wantFr) {
      misplaced++;
      console.log(`  wrong language  ${page}  ->  ${href}   resolved: ${path}`);
    }
  }

  const refs = [];
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) refs.push([m[1], url]);
  // srcset candidates are fetched by the browser too, so a typo in one is a broken image on
  // the screens that ask for it, and nothing else would notice.
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const cand = part.trim().split(/\s+/)[0];
      if (cand) refs.push([cand, url]);
    }
  }

  for (const m of html.matchAll(/href="([^"]+\.css)"/g)) {
    const cssUrl = new URL(m[1], url).href;
    const css = await (await fetch(cssUrl)).text().catch(() => '');
    for (const u of css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) refs.push([u[1], cssUrl]);
  }

  for (const [ref, base] of refs) {
    if (/^(https?:|mailto:|tel:|data:)/.test(ref) || ref === '#' || ref.includes('${')) continue;
    const abs = new URL(ref, base);
    const code = (await fetch(abs)).status;
    checked++;
    if (code !== 200) { bad++; console.log(`  ${code}  ${page}  ->  ${ref}   resolved: ${abs.pathname}`); }
  }
}
console.log(`${pages.length} pages: ${checked} local refs fetched, ${bad} broken, ${misplaced} nav links in the wrong language`);
srv.close();
process.exit(bad || misplaced ? 1 : 0);
