#!/bin/sh
# Copyright (c) 2026 Ahmed Taha Bouallegui
# SPDX-License-Identifier: GPL-3.0-or-later
# Link and asset checker: every local reference in the site must resolve to a real file.
# Usage: make check   (or scripts/check-links.sh from anywhere in the repo)
# Exits non-zero when a local href/src/url() is missing or a dead href="#" is present.

cd "$(dirname "$0")/.." || exit 1

problems=$(
  for f in *.html fr/*.html posts/*.html css/output.css fonts/fonts.css js/*.js; do
    [ -f "$f" ] || continue
    {
      # ${SITE_ROOT} and ${window.LANG_LINK.href} in js/partials.js interpolate to a
      # site-root-absolute URL; rewrite any such interpolation to "/" so it is checked as a
      # root-absolute reference.
      grep -o 'href="[^"]*"' "$f" | sed 's/^href="//; s/"$//; s/\${[^}]*}/\//g'
      grep -o 'src="[^"]*"'  "$f" | sed 's/^src="//;  s/"$//'
      grep -o "url('[^']*')" "$f" | sed "s/^url('//; s/')$//"
    } | while read -r t; do
      case "$t" in
        http://*|https://*|mailto:*|tel:*|data:*) continue ;;
        '?'*) continue ;;
        '#') echo "DEAD LINK   href=\"#\"   in $f"; continue ;;
      esac
      path="${t%%#*}"; path="${path%%\?*}"
      [ -z "$path" ] && continue
      # Site-root-absolute ("/about.html") maps to the repo root; anything else is
      # relative to the referencing file.
      case "$path" in
        /*) resolved=".$path" ;;
        *)  resolved="$(dirname "$f")/$path" ;;
      esac
      [ -e "$resolved" ] || echo "MISSING     $t   (referenced by $f)"
    done
  done | sort -u
)

if [ -n "$problems" ]; then
  printf '%s\n' "$problems"
  echo "check-links: FAILED"
  exit 1
fi

echo "check-links: all local references resolve"
echo
echo "external origins referenced by the site:"
grep -ho 'https\{0,1\}://[a-z0-9.-]*' *.html fr/*.html posts/*.html js/*.js 2>/dev/null | sort -u | sed 's/^/  /'
