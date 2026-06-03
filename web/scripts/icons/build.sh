#!/usr/bin/env bash
# Regenerate the Apple/PWA touch icon from its SVG source.
# Requires librsvg:  brew install librsvg
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
out="$here/../../app/apple-icon.png"

rsvg-convert -w 180 -h 180 "$here/apple-icon.svg" -o "$out"
echo "Wrote $out ($(rsvg-convert --version | head -1))"
