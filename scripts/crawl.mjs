// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// Browser-faithful asset check: `make crawl`.
//
// scripts/check-links.sh reads the source and proves every written reference points at a file
// that exists. This one goes the other way: it serves the repo over HTTP and requests each
// reference the way a browser would, so a relative path that is right on disk but wrong from
// the page's own URL (posts/*.html and fr/*.html are one level down) shows up as a 404.
// Stylesheet url() values resolve against the stylesheet, not the page, and that is checked too.
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
  const f = normalize(join(ROOT, p));
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

let bad = 0, checked = 0;
for (const page of pages) {
  const url = `http://127.0.0.1:${PORT}${page}`;
  const html = await (await fetch(url)).text();

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
console.log(`${pages.length} pages: ${checked} local refs fetched, ${bad} broken`);
srv.close();
process.exit(bad ? 1 : 0);
