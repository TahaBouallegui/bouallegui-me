#!/bin/sh
# Copyright (c) 2026 Ahmed Taha Bouallegui
# SPDX-License-Identifier: GPL-3.0-or-later
# Regenerate images/og.png (1200x630 social card). Needs ImageMagick and any two sans fonts
# resolvable through fontconfig; nothing else. The right side carries images/portrait.jpg,
# cropped square from the top so the head survives, then cut into a circle.
#
#   nix-shell -p imagemagick fontconfig --run scripts/make-og.sh
set -eu

REG=$(fc-match -f '%{file}\n' 'DejaVu Sans:style=Book' 2>/dev/null || fc-match -f '%{file}\n')
BOLD=$(fc-match -f '%{file}\n' 'DejaVu Sans:style=Bold' 2>/dev/null || echo "$REG")

if [ ! -f "$REG" ]; then echo "no usable font found via fc-match" >&2; exit 1; fi
if [ ! -f images/portrait.jpg ]; then echo "images/portrait.jpg is missing, refusing to guess a placeholder" >&2; exit 1; fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# A 340 px circle, later placed at +800+145. The photo has to be given an alpha channel
# first: without it DstIn flattens the cut to opaque black instead of transparency. The ring
# is drawn after the cutout, so it sits on top of the photo rather than under it.
magick images/portrait.jpg -alpha set -resize 340x340^ -gravity north -extent 340x340 \
  \( -size 340x340 xc:none -fill white -draw "circle 170,170 170,0" \) \
  -compose DstIn -composite \
  -stroke 'rgba(0,150,199,0.85)' -strokewidth 5 -fill none -draw "circle 170,170 170,0" \
  "$TMP/portrait-circle.png"

magick -size 1200x630 gradient:#01324F-#0A1A2F \
  -fill none -strokewidth 1 -stroke 'rgba(0,119,182,0.20)' \
  -draw "$(seq 0 60 1200 | awk '{printf "line %s,0 %s,630 ", $1, $1}')" \
  -draw "$(seq 0 60 630  | awk '{printf "line 0,%s 1200,%s ", $1, $1}')" \
  "$TMP/portrait-circle.png" -geometry +800+145 -compose over -composite \
  -stroke none -fill '#FFFFFF' -font "$BOLD" -pointsize 84 -annotate +80+280 'bouallegui.me' \
  -fill '#0096C7' -font "$REG"  -pointsize 34 -annotate +80+345 'Cybersecurity and systems done right' \
  -fill '#94A3B8' -font "$REG"  -pointsize 22 -annotate +80+405 'Ahmed Bouallegui  -  M.Eng IoT and Cybersecurity, Polytech Lille' \
  -depth 8 -strip images/og.png

magick identify images/og.png
