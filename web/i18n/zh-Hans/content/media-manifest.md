# 下载清单

本编译环境**无法访问外部网络**，因此媒体文件和法庭文件以链接形式收录，而非直接存储于此。如需获取本地副本，请在**可访问外部网络的设备上**运行下方辅助脚本。

> **下载前请注意：** 请遵守各来源的版权规定及服务条款。新闻图片/文章及 YouTube 视频归创作者所有——仅供个人/研究参考存档，请勿传播受版权保护的媒体内容。法庭文件属于公开记录，但应尽可能通过法院书记官/官方系统获取（参见 [`../lawsuit/court-documents.md`](../lawsuit/court-documents.md)）。请继续**排除**评论或视频帧中可能出现的**任何个人信息/PII内容**。

## URL 列表

脚本所使用的纯文本 URL 列表与本文件存放于同一目录：

- `urls_videos.txt` — 原始来源视频及重要反应视频（每行一个 URL）
- `urls_pages.txt` — 需快照存档的文章/声明页面
- 法庭文件**不在**脚本处理范围内——请按 `../lawsuit/court-documents.md` 的说明通过 Utah XChange / Oregon eCourt 获取。

## 辅助脚本

本目录中的 `fetch_media.sh` 使用 `yt-dlp` 下载视频，并使用 `wget` 对文章页面进行快照存档。在可访问外部网络的设备上的使用方法：

```bash
cd media
# 下载视频（需安装 yt-dlp）：https://github.com/yt-dlp/yt-dlp
./fetch_media.sh videos
# 文章/页面快照（需安装 wget）
./fetch_media.sh pages
```

下载内容保存至 `media/_downloads/`（已列入 git 忽略清单）。对于任何提交至存档的内容，请添加简短说明，记录检索日期及来源，以确保存档可审计。