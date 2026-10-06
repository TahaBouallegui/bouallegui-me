// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// Minimal dependency-free static server for local preview: `npm run serve`.
// Serves the repo root, with the MIME types the site actually needs (woff2 in particular,
// because a browser refuses to use a font served as text/plain).
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const PORT = Number(process.env.PORT || process.argv[2] || 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let file = normalize(join(ROOT, url));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  if (file.endsWith('/')) file = join(file, 'index.html');
  if (!existsSync(file) || !statSync(file).isFile()) {
    const missing = join(ROOT, '404.html');
    if (existsSync(missing)) {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      createReadStream(missing).pipe(res);
    } else { res.writeHead(404).end('not found'); }
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`bouallegui.me - http://localhost:${PORT}/   (Ctrl-C to stop)`);
  console.log(`serving ${ROOT}`);
});
