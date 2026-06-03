# Download Manifest

This compilation environment had **no outbound network access**, so media and court files are cataloged
by link rather than stored here. Run the helper below **from an unrestricted machine** to fetch local
copies if you want them.

> **Before you download:** respect each source's copyright and terms of service. News photos/articles
> and YouTube videos are owned by their creators — archive for personal/research reference, and do not
> redistribute copyrighted media. Court filings are public records but should be obtained from the
> clerk/official system where possible (see [`../lawsuit/court-documents.md`](../lawsuit/court-documents.md)).
> Continue to **exclude any personal/PII content** that may appear in comments or video frames.

## URL lists

The plain URL lists used by the script live alongside this file:

- `urls_videos.txt` — primary-source & key reaction videos (one URL per line)
- `urls_pages.txt` — article/statement pages to snapshot
- Court documents are intentionally **not** scripted here — obtain them via Utah XChange / Oregon eCourt
  per `../lawsuit/court-documents.md`.

## Helper script

`fetch_media.sh` (in this folder) downloads videos with `yt-dlp` and snapshots article pages with
`wget`. Usage from an unrestricted machine:

```bash
cd media
# videos (requires yt-dlp): https://github.com/yt-dlp/yt-dlp
./fetch_media.sh videos
# article/page snapshots (requires wget)
./fetch_media.sh pages
```

Downloads land in `media/_downloads/` (git-ignored). Add a short note recording the retrieval date and
source for anything you commit, to keep the archive auditable.
