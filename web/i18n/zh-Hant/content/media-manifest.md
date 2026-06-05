# 下載清單

此編譯環境**無對外網路存取權限**，因此媒體與法院檔案以連結方式編目，而非儲存於此。如需取得本地副本，請**在不受限制的機器上**執行下方的輔助腳本。

> **下載前請注意：** 請遵守各來源的著作權規定及服務條款。新聞照片／文章與 YouTube 影片均屬其創作者所有——僅供個人／研究參考用途存檔，請勿重新散布受著作權保護的媒體內容。法院文件屬於公開記錄，但應盡可能透過書記官／官方系統取得（請參閱 [`../lawsuit/court-documents.md`](../lawsuit/court-documents.md)）。請持續**排除**評論或影片畫面中可能出現的**任何個人資料／個人識別資訊（PII）**。

## URL 清單

腳本所使用的純文字 URL 清單與本檔案存放於同一目錄：

- `urls_videos.txt` — 第一手來源影片及重要回應影片（每行一個 URL）
- `urls_pages.txt` — 需製作快照的文章／聲明頁面
- 法院文件刻意**未納入**腳本——請依照 `../lawsuit/court-documents.md` 的說明，透過 Utah XChange／Oregon eCourt 取得。

## 輔助腳本

本目錄下的 `fetch_media.sh` 使用 `yt-dlp` 下載影片，並使用 `wget` 製作文章頁面快照。在不受限制的機器上的使用方式：

```bash
cd media
# 下載影片（需安裝 yt-dlp）：https://github.com/yt-dlp/yt-dlp
./fetch_media.sh videos
# 文章／頁面快照（需安裝 wget）
./fetch_media.sh pages
```

下載內容將存放於 `media/_downloads/`（已加入 git 忽略清單）。對於任何提交至存檔的內容，請附上簡短備註，記錄擷取日期與來源，以確保存檔的可稽核性。