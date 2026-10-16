// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later

// Publish the NixOS series: markdown drafts -> posts/<slug>.html in the site template.
//
//   node scripts/publish-blog.mjs                 build posts/ from src/blog/
//   node scripts/publish-blog.mjs --import [dir]  copy drafts out of the NixOS config
//                                                 repo into src/blog/ (one-time import;
//                                                 applies PATCHES + REDACTIONS)
//
// The published prose lives in src/blog/ next to the site, so editing it is a normal
// diff against this repo. Your originals in ~/.config/nixos/blog stay untouched.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const argv = process.argv.slice(2);
const IMPORT = argv.includes('--import');
const SRC = IMPORT ? (argv.find((a) => !a.startsWith('--')) ?? '/home/atb/.config/nixos/blog') : 'src/blog';
// One publication date per part, set in the POSTS table below.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const isoParts = (iso) => iso.split('-').map(Number);
const longDate = (iso) => { const [y, m, d] = isoParts(iso); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const shortDate = (iso) => { const [y, m, d] = isoParts(iso); return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`; };
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const shortDateFr = (iso) => { const [y, m, d] = isoParts(iso); return `${d} ${MONTHS_FR[m - 1]} ${y}`; };

// Structured data for a note. Google reads it for the rich result; the fields are the same ones
// the page already shows, so there is nothing here that the prose does not say.
const ldPosting = (p, title) => `  <script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title,
  url: `https://bouallegui.pages.dev/posts/${p.slug}.html`, datePublished: p.date,
  image: 'https://bouallegui.pages.dev/images/og.png', inLanguage: 'en',
  author: { '@type': 'Person', name: 'Ahmed Taha Bouallegui', url: 'https://bouallegui.pages.dev/' },
})}</script>
`;

const POSTS = [
  { file: '01-architecture.md', slug: 'one-file-one-capability', date: '2026-03-08', tags: ['flake-parts', 'import-tree'],
    desc: 'How the config is laid out. import-tree reads every file in modules/, so there is no import list to keep current, and one convention holds the rest together.',
    og: 'The filesystem is the import list: flake-parts plus import-tree, and one convention to keep it readable.',
    fr: { title: "Un fichier, une capacité : comment j'ai arrêté de maintenir une liste d'imports",
      desc: "Comment la config est posée. import-tree lit chaque fichier de modules/, donc il n'y a pas de liste d'imports à tenir à jour, et une seule convention tient le reste." } },
  { file: '02-desktop.md', slug: 'a-desktop-that-scrolls', date: '2026-03-29', tags: ['niri', 'noctalia', 'wrappers'],
    desc: 'niri with noctalia and a colourscheme, packaged so the whole desktop builds as one thing, and menus that show the keybinds instead of asking you to remember them.',
    og: 'A scrollable-tiling desktop that builds as a single package.',
    fr: { title: 'Un bureau qui fait défiler au lieu d\'empiler',
      desc: "niri avec noctalia et un jeu de couleurs, empaquetés pour que tout le bureau se construise comme un seul objet, et des menus qui affichent les raccourcis au lieu de demander de les retenir." } },
  { file: '03-secrets.md', slug: 'secrets-with-keys-i-already-had', date: '2026-04-19', tags: ['sops-nix', 'age'],
    desc: 'Committing secrets in the open, encrypted with age, using keys derived by ssh-to-age from SSH keys you already have.',
    og: 'sops-nix with age identities derived from SSH keys you already have.',
    fr: { title: "Des secrets, gardés avec des clés que j'avais déjà",
      desc: 'Commiter des secrets à découvert, chiffrés avec age, à partir de clés dérivées par ssh-to-age de clés SSH que vous avez déjà.' } },
  { file: '04-self-hosted-services.md', slug: 'a-private-cloud-with-a-guest-list', date: '2026-05-10', tags: ['tailscale', 'immich', 'jellyfin'],
    desc: 'Immich, Jellyfin, Grocy and SearXNG on a home server, with nothing reachable from the internet. How the tailnet-only setup is put together.',
    og: 'Self-hosting with a guest list: tailnet-only services and no WAN exposure.',
    fr: { title: "Un cloud privé, à la taille des gens qui s'en servent vraiment",
      desc: "Immich, Jellyfin, Grocy et SearXNG sur un serveur à la maison, sans rien d'atteignable depuis internet. Comment la configuration tailnet-only est montée." } },
  { file: '05-neovim.md', slug: 'an-editor-built-up-from-nothing', date: '2026-05-31', tags: ['neovim', 'tree-sitter', "lz.n"],
    desc: 'Building Neovim from an empty init.lua: lazy loading, a colourscheme, a tree-sitter grammar for my own file formats, and nixd pointed at the flake.',
    og: 'A Neovim config built from an empty init.lua, including a tree-sitter grammar of my own.',
    fr: { title: "Un éditeur construit à partir de rien, exprès",
      desc: "Construire Neovim depuis un init.lua vide : chargement paresseux, un jeu de couleurs, une grammaire tree-sitter pour mes propres formats de fichier, et nixd pointé sur le flake." } },
  { file: '07-local-llm.md', slug: 'running-the-model-myself', date: '2026-09-13', tags: ['llama.cpp', 'OpenAI API'],
    desc: 'ik_llama.cpp built with CPU flags for the hardware I actually have, serving an OpenAI-compatible API to a chat interface.',
    og: 'Local inference: ik_llama.cpp tuned by cmake flag, behind an OpenAI-compatible API.',
    fr: { title: 'Faire tourner le modèle moi-même',
      desc: "ik_llama.cpp construit avec des flags CPU pour le matériel que j'ai vraiment, servant une API OpenAI-compatible à une interface de chat." } },
  { file: '08-multi-host.md', slug: 'one-flake-three-machines', date: '2026-06-21', tags: ['flake-parts', 'hosts'],
    desc: 'Three machines that share almost nothing except the flake. What stays common, what stays per-host, and how to stop them drifting apart.',
    og: 'One flake, three very different machines, and the habits that keep them in step.',
    fr: { title: 'Un flake, trois machines qui se ressemblent à peine',
      desc: "Trois machines qui ne partagent presque rien sauf le flake. Ce qui reste commun, ce qui reste par machine, et comment les empêcher de diverger." } },
  { file: '09-environment.md', slug: 'my-shell-is-a-package', date: '2026-07-12', tags: ['fish', 'wrappers'],
    desc: 'The shell as a derivation: one wrapped package that every entry point resolves to, with git identity set at build time.',
    og: 'A shell as a Nix package, referenced by every place a shell appears.',
    fr: { title: 'Mon shell est un paquet',
      desc: "Le shell comme dérivation : un seul paquet wrappé vers lequel chaque point d'entrée se résout, avec l'identité git fixée à la construction." } },
];
POSTS.forEach((p, i) => { p.series = i + 1; });

// Cross-links. Prev/next come from `series`; these are the topical neighbours and the
// portfolio cards each part actually describes. Kept here so the footer of every post is
// generated rather than hand-maintained.
const SEE = {
  'one-file-one-capability': ['one-flake-three-machines', 'secrets-with-keys-i-already-had'],
  'a-desktop-that-scrolls': ['my-shell-is-a-package', 'an-editor-built-up-from-nothing'],
  'secrets-with-keys-i-already-had': ['running-the-model-myself', 'one-flake-three-machines'],
  'a-private-cloud-with-a-guest-list': ['running-the-model-myself', 'one-file-one-capability'],
  'an-editor-built-up-from-nothing': ['my-shell-is-a-package', 'a-desktop-that-scrolls'],
  'running-the-model-myself': ['secrets-with-keys-i-already-had', 'my-shell-is-a-package'],
  'one-flake-three-machines': ['one-file-one-capability', 'secrets-with-keys-i-already-had'],
  'my-shell-is-a-package': ['an-editor-built-up-from-nothing', 'a-desktop-that-scrolls'],
};

const PROJECTS = {
  'one-file-one-capability': ['nix-monorepo'],
  'a-desktop-that-scrolls': ['nix-monorepo'],
  'secrets-with-keys-i-already-had': ['nix-monorepo', 'self-hosted'],
  'a-private-cloud-with-a-guest-list': ['self-hosted'],
  'an-editor-built-up-from-nothing': ['nix-monorepo'],
  'running-the-model-myself': ['self-hosted', 'nix-monorepo'],
  'one-flake-three-machines': ['nix-monorepo'],
  'my-shell-is-a-package': ['nix-monorepo'],
};

const PROJECT_LABELS = {
  'nix-monorepo': 'One flake for every machine I run',
  'self-hosted': 'Self-hosted server infrastructure',
  'wireless': 'Wireless station detection over nl80211',
};

// Portfolio cards that point back into the series. Anchors are added to portfolio.html
// by this same script, so the two sides cannot disagree.
const CARD_NOTES = {
  'nix-monorepo': ['one-file-one-capability', 'secrets-with-keys-i-already-had', 'one-flake-three-machines'],
  'self-hosted': ['a-private-cloud-with-a-guest-list', 'running-the-model-myself'],
  'wireless': ['nl80211-wireless-detection'],
};

// Every edit made to your prose, so it can be reviewed rather than trusted.
const PATCHES = [
  ['01-architecture.md', 'a laptop, a desktop tower, a headless server', 'a laptop, an older laptop kept for conservation, and a headless server'],
  ['08-multi-host.md', 'A desktop tower with a different GPU vendor entirely.', 'An older laptop I no longer use, kept for conservation rather than service.'],
  ['08-multi-host.md', '# myMachine/configuration.nix (desktop tower)', '# myMachine/configuration.nix (retired, kept for conservation)'],
  ['08-multi-host.md', 'headless server with no display at all', 'headless server I will call aleph, with no display at all'],
  ['04-self-hosted-services.md', "That's what the home server is for.", "That's what the home server, which I will call aleph, is for."],
];

// Public identifiers that should not appear in full on a public page.
const REDACTIONS = [
  [/age1u2wj4l5rjafnmk9dyaw5adz67yxt9z5lqktfyfe35g2hnwaxqyhqm34r5t/g, 'age1u2wj…'],
  [/age18gr72wn9rg2nhnj3j073f4y6l82wc9uxgxy36gvnzesdtr46nvzs9c2dcd/g, 'age18gr7…'],
  [/GIT_AUTHOR_NAME = "Za3ter"/, 'GIT_AUTHOR_NAME = "<name>"'],
  [/users\.users\.atb\.shell/, 'users.users.<user>.shell'],
  [/robotechServer/g, 'aleph'],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, (_, c) => `<code class="font-mono text-sm text-ocean-dark">${c}</code>`)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    (_, t, u) => `<a href="${u}" target="_blank" rel="noopener noreferrer" class="font-semibold text-link hover:text-ocean-dark">${t}</a>`)
  // same-site links stay relative and untargeted, like every other local reference
  .replace(/\[([^\]]+)\]\((?!https?:\/\/|mailto:)([^)]+)\)/g,
    (_, t, u) => `<a href="${u}" class="font-semibold text-link hover:text-ocean-dark">${t}</a>`);

// markdown -> the site's article classes
function toHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let para = [], list = [], fence = null;
  const flushPara = () => { if (para.length) { out.push(`        <p class="leading-relaxed">${inline(para.join(' '))}</p>`); para = []; } };
  const flushList = () => {
    if (list.length) {
      out.push('        <ul class="space-y-2 pl-5 list-disc marker:text-link">');
      for (const item of list) out.push(`          <li class="leading-relaxed">${inline(item)}</li>`);
      out.push('        </ul>');
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (fence !== null) {
      if (line === '```') { out.push(`        <pre class="rounded-card border border-slate-200 bg-slate-50 p-5 text-sm overflow-x-auto"><code class="font-mono text-xs leading-relaxed">${esc(fence.join('\n'))}</code></pre>`); fence = null; }
      else fence.push(raw);
      continue;
    }
    if (line.startsWith('```')) { flushPara(); flushList(); fence = []; continue; }
    if (/^## /.test(line)) { flushPara(); flushList(); out.push(`        <h2 class="mt-8 text-2xl font-display font-semibold text-ocean-dark">${inline(line.slice(3))}</h2>`); continue; }
    if (/^# /.test(line)) continue;                       // the H1 becomes the page title
    if (/^- /.test(line)) { flushPara(); list.push(line.slice(2)); continue; }
    // A markdown list item wrapped across lines: the continuation is indented, and
    // belongs to the item above it, not to a new paragraph.
    if (list.length && /^ {2,}\S/.test(line)) { list[list.length - 1] += ' ' + line.trim(); continue; }
    if (line === '') { flushPara(); flushList(); continue; }
    if (para.length === 0 && list.length) { flushList(); }
    para.push(line);
  }
  flushPara(); flushList();
  return out.join('\n');
}

const titleOf = (md) => /^# (.+)$/m.exec(md)[1].trim();

const page = (p, title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light dark">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} - Ahmed Bouallegui</title>
  <meta name="description" content="${esc(p.desc)}">
  <meta name="theme-color" content="#023E8A">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(p.og)}">
  <meta property="og:type" content="article">
  <link rel="preload" href="../fonts/files/Inter.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../fonts/files/SpaceGrotesk.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../fonts/fonts.css">
  <link rel="canonical" href="https://bouallegui.pages.dev/posts/${p.slug}.html">
  <link rel="alternate" type="application/rss+xml" title="Field notes (RSS)" href="../feed.xml">
  <meta property="og:url" content="https://bouallegui.pages.dev/posts/${p.slug}.html">
  <meta property="og:site_name" content="Ahmed Taha Bouallegui">
  <meta property="og:image" content="https://bouallegui.pages.dev/images/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Ahmed Taha Bouallegui: cybersecurity and systems done right">
  <meta property="article:published_time" content="${p.date}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://bouallegui.pages.dev/images/og.png">
  <link rel="icon" href="../images/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png" sizes="180x180">
  <link rel="stylesheet" href="../css/output.css">
  <script src="../js/theme.js"></script>
${ldPosting(p, title)}</head>
<body class="bg-surface text-ink">
  <nav data-part="nav" aria-label="Primary"></nav>

  <main id="main">
    <section class="relative pt-32 pb-40 bg-ocean-deep">
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-ocean-deep to-surface" aria-hidden="true"></div>
      <header class="container relative px-5 md:px-8">
        <a href="../blog.html" class="inline-flex items-center gap-2 font-semibold text-ocean-glow hover:text-white mb-6">&larr; Back to Blog</a>
        <p class="eyebrow text-ocean-glow">NixOS, in pieces</p>
        <h1 class="section-title mb-6 text-white text-3xl font-display font-bold leading-tight sm:text-4xl">${esc(title)}</h1>
        <div class="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <span class="flex items-center gap-2"><span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-display font-bold text-ocean-glow">A</span> Ahmed Bouallegui</span>
          <span>·</span><span><time datetime="${p.date}">${longDate(p.date)}</time></span>
          <span>·</span><a href="../blog.html" class="hover:text-white">Part ${p.series} of ${POSTS.length}</a>
        </div>
      </header>
    </section>

    <article class="pb-24">
      <div class="container mx-auto mt-10 grid max-w-3xl gap-8 px-5 text-slate-700 md:px-8">
${body}
      </div>
    </article>
  </main>

  <footer data-part="footer"></footer>

  <script src="../js/main.js"></script>
</body>
</html>
`;

const applied = [];
const titles = {};
const prepared = [];

if (IMPORT) {
  mkdirSync('src/blog', { recursive: true });
  for (const p of POSTS) {
    let md = readFileSync(`${SRC}/${p.file}`, 'utf8');
    for (const [file, from, to] of PATCHES) {
      if (file !== p.file || !md.includes(from)) continue;
      md = md.replace(from, to);
      applied.push([p.file, from, to]);
    }
    for (const [re, to] of REDACTIONS) {
      if (re.test(md)) { md = md.replace(re, to); applied.push([p.file, String(re), to]); }
    }
    writeFileSync(`src/blog/${p.file}`, md);
    console.log(`  src/blog/${p.file}  ←  ${SRC}/${p.file}`);
  }
  console.log('\nimport edits (your drafts elsewhere are not touched):');
  for (const [f, from, to] of applied) console.log(`  ${f}: ${from.slice(0, 60)}  ->  ${to.slice(0, 40)}`);
  process.exit(0);
}

for (const p of POSTS) {
  let md = readFileSync(`${SRC}/${p.file}`, 'utf8');
  // Redactions are re-applied on every build as a safety net; prose edits live in
  // src/blog/ as ordinary committed text, reviewable with git diff.
  for (const [re, to] of REDACTIONS) {
    if (re.test(md)) { md = md.replace(re, to); applied.push([p.file, String(re), to]); }
  }
  const title = titleOf(md);
  titles[p.slug] = title;
  prepared.push({ p, md });
}

// Footer for each post: series neighbours, curated neighbours, and the portfolio cards
// the part describes. Built after every title is known so the links can be labelled.
const bySlug = Object.fromEntries(POSTS.map((x) => [x.slug, x]));
const link = (slug) => `<a href="${slug}.html" class="font-semibold text-link hover:text-ocean-dark">${esc(titles[slug] ?? slug)}</a>`;

const footerFor = (p) => {
  const prev = POSTS.find((x) => x.series === p.series - 1);
  const next = POSTS.find((x) => x.series === p.series + 1);
  const card = (q, align) => `          <a href="${q.slug}.html" class="card card-link p-5${align === 'right' ? ' text-right' : ''}"${align === 'right' ? ' aria-label="Next part"' : ' aria-label="Previous part"'}>
            <span class="eyebrow block">Part ${q.series}</span>
            <span class="mt-1 block font-display font-semibold leading-snug">${esc(titles[q.slug])}</span>
          </a>`;
  const seriesCard = `          <a href="../blog.html" class="card card-link p-5 text-right">
            <span class="eyebrow block">The series</span>
            <span class="mt-1 block font-display font-semibold leading-snug">All eight parts</span>
          </a>`;
  const pager = [prev ? card(prev) : seriesCard, next ? card(next, 'right') : seriesCard].join('\n');

  // "Keep reading" must not repeat the two cards directly above it.
  const neighbours = new Set([prev?.slug, next?.slug]);
  const see = (SEE[p.slug] ?? []).filter((s) => !neighbours.has(s));
  const seeHtml = see.map((s) => `            <li>${link(s)}</li>`).join('\n');
  const projects = (PROJECTS[p.slug] ?? []).map((a) => `<a href="../portfolio.html#${a}" class="font-semibold text-link hover:text-ocean-dark">${esc(PROJECT_LABELS[a])}</a>`).join(' · ');

  return `
        <nav class="mt-10 grid gap-4 sm:grid-cols-2" aria-label="More from this series">
${pager}
        </nav>

        <div class="mt-6 rounded-card border border-ocean/20 bg-ocean/5 p-5">
          <p class="font-semibold text-ocean-dark mb-2">Keep reading</p>
          <ul class="space-y-1 text-sm text-slate-600">
${seeHtml}
          </ul>
          <p class="mt-3 text-sm text-slate-500">Part ${p.series} of ${POSTS.length} of <a href="../blog.html" class="font-semibold text-link hover:text-ocean-dark">NixOS, in pieces</a>.</p>
        </div>

        <p class="text-sm text-slate-500">Where this lives: ${projects}</p>`;
};

for (const { p, md } of prepared) {
  writeFileSync(`posts/${p.slug}.html`, page(p, titles[p.slug], toHtml(md) + footerFor(p)));
  console.log(`  posts/${p.slug}.html  ←  ${p.file}  (${titles[p.slug]})`);
}

// The blog index grids and the sitemap are generated from the same metadata, so a new
// part cannot be published without appearing in both. The French index lists the same
// parts (the notes themselves are only written in English) with translated card copy.
const card = (p, lang) => {
  const fr = lang === 'fr';
  return `          <article class="card card-link fade-in" data-animate>
            <div class="mb-3 flex items-center gap-3 text-xs text-slate-500"><span class="chip">${fr ? 'Partie' : 'Part'} ${p.series}</span><span><time datetime="${p.date}">${fr ? shortDateFr(p.date) : shortDate(p.date)}</time></span></div>
            <h2 class="mb-2 font-display text-lg font-semibold leading-snug">${esc(fr ? p.fr.title : titles[p.slug])}</h2>
            <p class="mb-4 text-sm text-slate-600">${esc(fr ? p.fr.desc : p.desc)}</p>
            <div class="mb-4 flex flex-wrap gap-2">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
            <a href="${fr ? '../posts/' : 'posts/'}${p.slug}.html" class="font-semibold text-link hover:text-ocean-dark">${fr ? 'Lire &rarr;' : 'Read it &rarr;'}</a>
          </article>`;
};

const gridFor = (lang) => `        <!-- SERIES:START -->\n        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-animate>\n${POSTS.map((p) => card(p, lang)).join('\n')}\n        </div>\n        <!-- SERIES:END -->`;
for (const [file, lang] of [['blog.html', 'en'], ['fr/blog.html', 'fr']]) {
  const blog = readFileSync(file, 'utf8');
  if (!/ {8}<!-- SERIES:START -->/.test(blog)) throw new Error(`${file} is missing the SERIES:START sentinel`);
  writeFileSync(file, blog.replace(/ {8}<!-- SERIES:START -->[\s\S]*? {8}<!-- SERIES:END -->/, gridFor(lang)));
  console.log(`\n  ${file}: series grid rebuilt (${POSTS.length} cards)`);
}

// Post URLs are pruned when their part is dropped, so a deleted post cannot linger in
// the sitemap. Hand-written posts are listed explicitly.
const MANUAL_POST_URLS = [
  'https://bouallegui.pages.dev/posts/nl80211-wireless-detection.html',
  'https://bouallegui.pages.dev/posts/a-keyboard-that-took-out-its-own-mcu.html',
  'https://bouallegui.pages.dev/posts/an-aws-account-from-the-inside.html',
  'https://bouallegui.pages.dev/posts/what-a-harness-is-learned-the-slow-way.html',
  'https://bouallegui.pages.dev/posts/getting-a-125b-model-onto-a-12gb-card.html',
];
const knownPosts = new Set([...POSTS.map((p) => `https://bouallegui.pages.dev/posts/${p.slug}.html`), ...MANUAL_POST_URLS]);
const sitemap = readFileSync('sitemap.txt', 'utf8')
  .split('\n').filter((l) => l && (!l.includes('/posts/') || knownPosts.has(l)));
for (const p of POSTS) {
  const url = `https://bouallegui.pages.dev/posts/${p.slug}.html`;
  if (!sitemap.includes(url)) sitemap.push(url);
}
// Hand-written posts are not in POSTS, so they have to be appended as well or a fresh
// regeneration drops them from the sitemap.
for (const url of MANUAL_POST_URLS) {
  if (!sitemap.includes(url)) sitemap.push(url);
}
// The French pages are hand-written translations of the six index pages, not generated,
// so they are listed here to stay in the sitemap.
for (const page of ['fr/', 'fr/portfolio.html', 'fr/blog.html', 'fr/about.html', 'fr/resume.html', 'fr/contact.html']) {
  const url = `https://bouallegui.pages.dev/${page}`;
  if (!sitemap.includes(url)) sitemap.push(url);
}
writeFileSync('sitemap.txt', sitemap.join('\n') + '\n');
console.log(`  sitemap.txt: ${sitemap.length} urls`);

// Portfolio cards get an anchor and point back into the notes that cover them, so the
// project pages and the series cross-reference each other in both directions.
const NOTE_TITLES = { 'nl80211-wireless-detection': 'The wifi module stopped shelling out to iw', ...titles };
const CARD_TITLES = {
  'nix-monorepo': 'One flake for every machine I run',
  'self-hosted': 'Self-hosted server infrastructure',
  'wireless': 'Wireless station detection over nl80211',
};
const chunks = readFileSync('portfolio.html', 'utf8').split(/(?=<article )/);
let linked = 0;
for (let i = 0; i < chunks.length; i++) {
  const c = chunks[i];
  const anchor = Object.keys(CARD_TITLES).find((a) => c.includes(`>${CARD_TITLES[a]}</h2>`));
  if (!anchor || !(CARD_NOTES[anchor] ?? []).length) continue;
  if (c.includes(`id="${anchor}"`)) continue;
  const notes = `              <p class="mt-3 text-xs text-slate-500">Notes: ${(CARD_NOTES[anchor])
    .map((s) => `<a href="posts/${s}.html" class="font-semibold text-link hover:text-ocean-dark">${esc(NOTE_TITLES[s] ?? s)}</a>`).join(' · ')}</p>`;
  let nc = c.replace('<article class="card card-link fade-in overflow-hidden p-0" data-animate>',
    `<article id="${anchor}" class="card card-link fade-in overflow-hidden p-0" data-animate>`);
  nc = nc.replace(/(<\/a>)(\s*<\/div>\s*<\/article>)/, `$1\n${notes}$2`);
  if (nc === c) { console.log(`  !! could not anchor card: ${anchor}`); continue; }
  chunks[i] = nc;
  linked++;
}
writeFileSync('portfolio.html', chunks.join(''));
console.log(`  portfolio.html: ${linked} cards anchored and cross-linked`);
console.log('\nedits applied to prose:');
for (const [f, from, to] of applied) console.log(`  ${f}: ${from.slice(0, 60)}  ->  ${to.slice(0, 40)}`);
