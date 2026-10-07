# Copyright (c) 2026 Ahmed Taha Bouallegui
# SPDX-License-Identifier: GPL-3.0-or-later
# Static site: Tailwind input -> css/output.css, plus the few generated assets.
# npm/node are assumed on PATH (on NixOS: nix-shell -p nodejs --run make css).

NODE ?= node

.PHONY: help dev build css fonts og hero feed partials cv cv-en cv-fr check clean

help:
	@printf '%s\n' \
	"make css       build css/output.css minified (commit the result)" \
	"make dev       watch src/input.css while developing" \
	"make fonts     re-download the latin font subsets into fonts/" \
	"make og        regenerate images/og.png (needs ImageMagick + fontconfig)" \
	"make hero      rebuild js/vendor/hero.bundle.js from src/hero.js (needs esbuild)" \
	"make feed      rebuild feed.xml from the posts (commit the result)" \
	"make partials  stamp nav, footer and skip link into every page (commit the result)" \
	"make cv        build both CV PDFs (needs texlive with moderncv and babel-french)" \
	"make check     verify every local href/src/url() resolves and no href=\"#\" remains"

css:
	npm run build

dev:
	npm run dev

build: css

fonts:
	$(NODE) scripts/selfhost-fonts.mjs

og:
	sh scripts/make-og.sh

# The bundle is committed like css/output.css is: the site never fetches three from a CDN.
hero:
	npm run hero

# feed.xml is generated from posts/*.html and committed like css/output.css is.
feed:
	$(NODE) scripts/build-feed.mjs

# The nav, footer and skip link live in scripts/partials.mjs and are stamped into the pages,
# so the menu is in the HTML before any script runs. Commit the rewritten pages.
partials:
	$(NODE) scripts/render-partials.mjs

cv: cv-en cv-fr

# Each CV is compiled twice so the page breaks settle: both have to stay on one page.
# Without a system texlive, the Nix shell that carries the right packages is:
#   nix shell --impure --expr '(with import <nixpkgs> {}; texlive.combine { inherit (texlive) scheme-medium moderncv babel-french; })'
cv-en:
	cd cv && pdflatex -interaction=nonstopmode bouallegui-cv-en.tex && pdflatex -interaction=nonstopmode bouallegui-cv-en.tex && rm -f bouallegui-cv-en.aux bouallegui-cv-en.log bouallegui-cv-en.out

cv-fr:
	cd cv && pdflatex -interaction=nonstopmode bouallegui-cv-fr.tex && pdflatex -interaction=nonstopmode bouallegui-cv-fr.tex && rm -f bouallegui-cv-fr.aux bouallegui-cv-fr.log bouallegui-cv-fr.out

check:
	sh scripts/check-links.sh

clean:
	rm -f cv/*.aux cv/*.log cv/*.out
