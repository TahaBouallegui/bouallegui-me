// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// sitemap.txt must list exactly the pages that exist and are meant to be indexed.
// `make sitemap` prints what to change; CI runs the check and fails on a difference.
//
// A plain text file, one URL per line, is a sitemap format (sitemaps.org protocol, "Other
// sitemap formats"), so there is no XML to generate. What goes stale is the list itself: a new
// note that never made it in, or a page that was renamed and left a dead URL behind.
//
// The two 404 pages are deliberately absent: they carry robots noindex, and a URL in a sitemap
// asks for a crawl of something that must not be indexed.

import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? new URL('.', import.meta.url).pathname.replace(/scripts\/$/, ''));
const ORIGIN = 'https://bouallegui.pages.dev';
const NOINDEX = new Set(['404.html', 'fr/404.html']);

const pages = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...readdirSync(ROOT + '/fr').filter((f) => f.endsWith('.html')).map((f) => 'fr/' + f),
  ...readdirSync(ROOT + '/posts').filter((f) => f.endsWith('.html')).map((f) => 'posts/' + f),
];

// The same mapping the canonical tags use: the two index pages are the site root and /fr/,
// everything else keeps its file name. _redirects 301s /index.html and /fr/index.html onto
// those, so the clean form is the only one that ends up in a search index.
const urlOf = (p) => (p === 'index.html' ? `${ORIGIN}/` : p === 'fr/index.html' ? `${ORIGIN}/fr/` : `${ORIGIN}/${p}`);

const expected = pages.filter((p) => !NOINDEX.has(p)).map(urlOf).sort();
const listed = readFileSync(ROOT + '/sitemap.txt', 'utf8').split('\n').map((l) => l.trim()).filter(Boolean).sort();

const missing = expected.filter((u) => !listed.includes(u));
const extra = listed.filter((u) => !expected.includes(u));

for (const u of missing) console.log(`  missing from sitemap.txt: ${u}`);
for (const u of extra) console.log(`  in sitemap.txt, no such indexable page: ${u}`);
if (listed.length !== new Set(listed).size) console.log('  duplicate entries in sitemap.txt');

console.log(`sitemap: ${expected.length} indexable pages, ${listed.length} listed, ${missing.length + extra.length} out of sync`);
process.exit(missing.length + extra.length ? 1 : 0);
