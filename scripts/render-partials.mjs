// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// Stamp the shared nav, footer and skip link into every page, from scripts/partials.mjs.
// `make partials`. The result is committed: the pages are the artifact, not the script.
//
// Idempotent. Re-running it rewrites the three stamped regions in place, so a change in
// scripts/partials.mjs shows up as a diff across the pages rather than as a rebuild step
// someone has to remember before deploying.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { navHtml, footerHtml, skipHtml, langLink } from './partials.mjs';

const ROOT = process.argv[2] ?? new URL('.', import.meta.url).pathname.replace(/scripts\/$/, '');

const pages = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...readdirSync(ROOT + 'fr').filter((f) => f.endsWith('.html')).map((f) => 'fr/' + f),
  ...readdirSync(ROOT + 'posts').filter((f) => f.endsWith('.html')).map((f) => 'posts/' + f),
];

const NAV = /<nav data-part="nav"([^>]*)>[\s\S]*?<\/nav>/;
const FOOTER = /<footer data-part="footer"[^>]*>[\s\S]*?<\/footer>/;
const SKIP = /<a id="skip"[\s\S]*?<\/a>/;
const BODY = /(<body[^>]*>\n)/;

let changed = 0;
for (const rel of pages) {
  const file = ROOT + rel;
  const src = readFileSync(file, 'utf8');
  const opts = {
    root: rel.includes('/') ? '../' : '',
    lang: rel.startsWith('fr/') ? 'fr' : 'en',
  };
  const link = langLink(rel);

  let out = src;
  if (!NAV.test(out)) { console.error(`${rel}: no <nav data-part="nav"> to stamp`); continue; }
  out = out.replace(NAV, (m, attrs) => `<nav data-part="nav"${attrs}>${navHtml({ ...opts, link })}  </nav>`);
  if (!FOOTER.test(out)) { console.error(`${rel}: no <footer data-part="footer"> to stamp`); continue; }
  out = out.replace(FOOTER, footerHtml(opts));
  if (SKIP.test(out)) out = out.replace(SKIP, skipHtml(opts));
  else out = out.replace(BODY, `$1  ${skipHtml(opts)}\n`);

  if (out !== src) { writeFileSync(file, out); changed++; }
}
console.log(`partials: ${pages.length} pages scanned, ${changed} rewritten`);
