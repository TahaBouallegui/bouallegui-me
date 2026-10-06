# Copyright (c) 2026 Ahmed Taha Bouallegui
# SPDX-License-Identifier: GPL-3.0-or-later
# Static site: Tailwind input -> css/output.css, plus the few generated assets.
# npm/node are assumed on PATH (on NixOS: nix-shell -p nodejs --run make css).

NODE ?= node

.PHONY: help dev build css fonts og hero feed cv cv-en cv-fr check clean

help:
	@printf '%s\n' \
	"make css     build css/output.css minified (commit the result)" \
	"make dev     watch src/input.css while developing" \
	"make fonts   re-download the latin font subsets into fonts/" \
	"make og      regenerate images/og.png (needs ImageMagick + fontconfig)" \
	"make hero    rebuild js/vendor/hero.bundle.js from src/hero.js (needs esbuild)" \
	"make feed    rebuild feed.xml from the posts (commit the result)" \
	"make cv      build both CV PDFs (needs texlive with moderncv and babel-french)" \
	"make check   verify every local href/src/url() resolves and no href=\"#\" remains"

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
	$(NODE) run hero

# feed.xml is generated from posts/*.html and committed like css/output.css is.
feed:
	$(NODE) scripts/build-feed.mjs

cv: cv-en cv-fr

cv-en:
	pdflatex cv_bouallegui.tex && pdflatex cv_bouallegui.tex && rm -f cv_bouallegui.aux cv_bouallegui.log cv_bouallegui.out

cv-fr:
	pdflatex cv_bouallegui_fr.tex && pdflatex cv_bouallegui_fr.tex && rm -f cv_bouallegui_fr.aux cv_bouallegui_fr.log cv_bouallegui_fr.out

check:
	sh scripts/check-links.sh

clean:
	rm -f cv_bouallegui.aux cv_bouallegui.log cv_bouallegui.out
	rm -f cv_bouallegui_fr.aux cv_bouallegui_fr.log cv_bouallegui_fr.out
