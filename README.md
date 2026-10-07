# bouallegui.me

Portfolio and field notes for Ahmed Bouallegui - M.Eng student in Internet of Things and
Cybersecurity at Polytech Lille. Static HTML, Tailwind, three.js on the hero only.

## Layout

```
index.html            hero + about teaser + selected work + recent notes
portfolio.html        six real projects
blog.html             published notes + what is in the queue
about.html            the longer story
resume.html           the CV in HTML (print stylesheet included)
contact.html          mailto composer + direct channels
404.html              the not-found page, served by the host on any miss
fr/*.html             French mirror of the six pages above (the notes stay in English)
posts/*.html          one file per note
feed.xml              RSS 2.0 of every note, generated from posts/*.html - do not hand-edit
sitemap.txt           every URL the site wants indexed
robots.txt            allow all, plus the Sitemap line
css/output.css        generated - do not hand-edit
js/partials.js        nav + footer + language switch, injected on every page
js/main.js            nav state, lightbox, fade-ins, parallax
js/vendor/hero.bundle.js  generated from src/hero.js + three - do not hand-edit
fonts/                self-hosted latin subsets + fonts.css
images/               favicon, social card, portrait
images/projects/      hand-drawn SVG diagrams (640x360), no stock photography
src/input.css         the only CSS source
src/hero.js           the 3D hero, written against the three API
src/blog/*.md         the NixOS series drafts that posts/ is generated from
src/blog/template.html  authoring skeleton for a hand-written note, not served
cv/                   both CVs: the LaTeX source and the PDFs the site links
cv/img/               the CV photo and the institution marks used by the French CV
scripts/              feed, blog generator, font subsets, social card, dev server, link check
```

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | install Tailwind, esbuild and three |
| `npm run dev` | watch `src/input.css` → `css/output.css` (unminified) |
| `npm run build` | same, minified - this is what gets committed |
| `npm run hero` | bundle `src/hero.js` + three into `js/vendor/hero.bundle.js` |
| `npm run feed` | rebuild `feed.xml` from `posts/*.html` (titles, summaries and dates are read back out of the pages) |
| `npm run serve` | local preview on `http://localhost:8080` (dependency-free Node server) |
| `make css` / `make check` / `make fonts` / `make og` / `make hero` / `make feed` / `make cv` | see `Makefile` |
| `node scripts/publish-blog.mjs` | regenerate the NixOS series from the markdown drafts (see below) |

## How paths work (read this if the site looks unstyled)

Every local reference is **relative to the file that uses it** (`css/output.css`, and
`../css/output.css` inside `posts/`). That makes the site work in all three ways it gets used:
opened straight from disk, served from a subdirectory, or served at a domain root. Root-absolute
paths (`/css/output.css`) look tidier but break the first two - the page then loads with no CSS,
no nav, and no fonts, which is what "it looks like a plain HTML page" means.

The shared nav and footer live in `js/partials.js` and are reused at the root, inside `posts/`,
and inside `fr/`, so their links are resolved against **the script's own URL**, not the page's.

## Languages

The six index pages exist in English and in French (`fr/`). `js/partials.js` works out which
language the page is in from its path relative to the site root, and points the switch at the
matching page: `about.html` to `fr/about.html`, `fr/about.html` back to `about.html`. A note has
no translation, so on `posts/*` the switch goes to `fr/blog.html`, which says the notes are in
English. Each pair cross-links with `hreflang` alternates and both URLs are in `sitemap.txt`.
The CV follows the same split: `cv/bouallegui-cv-en.pdf` and `cv/bouallegui-cv-fr.pdf`.

One caveat when opening files directly: browsers block ES modules over `file://`, so the 3D hero
stays a CSS gradient there. Everything else works. For the real thing, run `npm run serve`.

## Conventions worth keeping

- **Nothing on this site is fictional.** No placeholder projects, no stock screenshots, no
  metrics that were not measured. If code is private, the card says so.
- **`css/output.css` is generated.** Run `npm run build` before committing; CI fails if the
  committed stylesheet does not match a fresh build.
- **Fade-ins are gated on `<html class="js">`.** Without JavaScript the site is still readable
  and navigable - keep it that way.
- **Motion is opt-out.** Everything animated checks `prefers-reduced-motion`.
- **Fonts are self-hosted** (latin subset, three families, one woff2 each). No third-party
  requests on any page. Regenerate with `make fonts`.

## Deploy

Any static host. On Nginx:

```nginx
root /srv/bouallegui.me;
index index.html;
error_page 404 /404.html;          # otherwise the pretty 404 never shows
location ~* \.(woff2)$ { add_header Cache-Control "public, max-age=31536000, immutable"; }
```

## Open items

- `bouallegui.me` does not resolve yet. Canonical, `og:url`, and `sitemap.txt` assume it will;
  change the origin in `.scratch/head-pass.mjs`-style one-liners if the domain changes.
- GitHub (`github.com/TahaBouallegui`) currently has no public repositories. Until the mirrors
  land, project cards point at writeups or at the contact page rather than at a repo.
- Consider a domain-shaped email (`ahmed@bouallegui.me` forwarded from the VPS) in place of the
  Gmail address once the domain is live.
- The hero bundles three 0.186.1 into `js/vendor/hero.bundle.js` (539,701 bytes, 135 KB gzipped)
  instead of pulling it from unpkg, so no third-party script is fetched at page load. Rebuild it
  with `make hero` after touching `src/hero.js` or bumping `three`. If the hero goes, delete
  `src/hero.js`, the bundle, and the script tag in `index.html` and `fr/index.html`; the CSS
  gradient underneath already covers the hero.

## Where the blog sources live

The eight-part NixOS series is generated from markdown drafts that live in the NixOS config
repo (`~/.config/nixos/blog/NN-*.md`), not in this repository. The copies in `src/blog/` are
numbered 01 to 09 with 06 missing: that part was dropped upstream, and the gaps are left in
place so the file names still line up with the config repo. Edit them there, then
run `node scripts/publish-blog.mjs` to regenerate `posts/*.html`, the series grid in
`blog.html`, and `sitemap.txt`. Then run `make feed`: `scripts/build-feed.mjs` reads the
title, summary and date back out of every file in `posts/`, so `feed.xml` cannot drift from
the page it points at. Every edit the generator makes to the prose (redactions,
host renames) is listed in `PATCHES`/`REDACTIONS` at the top of the script and printed
when it runs.

## Dark mode

Colours are CSS custom properties (`--surface`, `--ink`, `--slate-*`, `--ocean-ink`) declared in
`src/input.css` and referenced from `tailwind.config.js`, so a theme is a variable swap and
not a `dark:` prefix on every element. Light is the default; the OS preference is honoured
through `@media (prefers-color-scheme: dark)`, and the nav toggle sets
`<html data-theme="dark|light">` and remembers it in `localStorage`. An inline script in each
`<head>` applies the stored choice before paint, so there is no flash. Dark hero bands keep
their light-on-dark greys in both themes (see the `.bg-ocean-deep, #hero` block).
Print output is unaffected: the `@media print` rules force black on white.

## License

GPL-3.0-or-later, full text in `LICENSE`. That covers the HTML, the CSS, the JavaScript, the build
scripts, the diagrams in `images/projects/`, the CV sources in `cv/` and the writing in `posts/`.
If you publish something built from this repository, the same terms apply to the whole of it.

A few things here are not mine to license:

- `fonts/files/*.woff2`: Inter, Space Grotesk and JetBrains Mono, all SIL Open Font License 1.1.
- `three@0.186.1`: MIT, bundled tree-shaken into `js/vendor/hero.bundle.js` and committed, home
  page only.
- Tailwind, PostCSS and autoprefixer: MIT, build time only.
- The six-lambda logomark in `images/projects/nix.svg`: my own drawing, but its geometry follows the
  parametric definition the NixOS project publishes, so the mark itself is theirs. NixOS design
  assets are CC BY 4.0 by the NixOS Project and contributors ([NixOS/branding](https://github.com/NixOS/branding));
  the attribution is also in a comment inside that file.
- `cv/img/`: the Polytech Lille, Université de Lille and Valeo marks that sit next to those
  names in the French CV. They come from Wikimedia Commons (`File:Polytech Lille logo.gif` under
  CC0, `File:Logotype Université de Lille 2022.svg` and `File:Valeo Logo.svg` tagged public domain
  as simple logos), cropped to their monograms with ImageMagick. They are the institutions'
  trademarks and are used only to identify where I studied and worked. `cv/img/portrait-cv.jpg`
  is a crop of my own portrait, used as the CV photo; the French CV carries one because that is the
  convention here, the English one does not.

Code quoted inside the notes stays under the terms of the project it came from. The wireless note
quotes from a private university repository; the keyboard note quotes from the course repository,
which is GPL-3.0-or-later as well, agreed with my binôme.

`images/projects/keyboard.jpg` is my own photograph, uploaded to the course wiki with the project
writeup and copied here, so it carries the same GPL-3.0-or-later as the rest of this repository.
