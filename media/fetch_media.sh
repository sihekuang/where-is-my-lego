#!/usr/bin/env bash
# fetch_media.sh — optionally download cataloged public media for local archival.
#
# Run from an UNRESTRICTED machine (this repo was compiled in a network-locked
# environment). Respect copyright and each platform's terms of service: archive
# for personal/research reference only; do not redistribute copyrighted media.
#
# Usage:
#   ./fetch_media.sh videos   # download videos listed in urls_videos.txt (needs yt-dlp)
#   ./fetch_media.sh pages    # snapshot article pages in urls_pages.txt (needs wget)
#
# Output goes to ./_downloads/ (git-ignored).

set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$HERE/_downloads"
mkdir -p "$OUT"

mode="${1:-}"
case "$mode" in
  videos)
    command -v yt-dlp >/dev/null 2>&1 || { echo "ERROR: yt-dlp not found. See https://github.com/yt-dlp/yt-dlp"; exit 1; }
    mkdir -p "$OUT/videos"
    grep -vE '^\s*#|^\s*$' "$HERE/urls_videos.txt" | while IFS= read -r url; do
      echo ">> video: $url"
      yt-dlp --no-playlist --write-info-json --write-thumbnail \
        -o "$OUT/videos/%(uploader)s - %(title)s [%(id)s].%(ext)s" "$url" || echo "   (skipped/failed: $url)"
    done
    ;;
  pages)
    command -v wget >/dev/null 2>&1 || { echo "ERROR: wget not found."; exit 1; }
    mkdir -p "$OUT/pages"
    grep -vE '^\s*#|^\s*$' "$HERE/urls_pages.txt" | while IFS= read -r url; do
      echo ">> page: $url"
      wget -e robots=off -p -k -E -nd -P "$OUT/pages" "$url" || echo "   (skipped/failed: $url)"
    done
    ;;
  *)
    echo "Usage: $0 {videos|pages}"; exit 2 ;;
esac

echo "Done. Files in: $OUT"
echo "Note: record the retrieval date + source for anything you commit, and exclude any PII."
