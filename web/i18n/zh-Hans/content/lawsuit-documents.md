# 法院文件 — 如何获取主要案卷

本环境**无法访问外部网络**，因此实际的法院 PDF 文件**无法**下载至本仓库。本文件将告知您如何以及从何处获取权威公开记录。请在可正常访问网络的设备上使用 [`../media/download_manifest.md`](../media/download_manifest.md) 工具下载副本。

## 权威原始来源

| 字段 | 内容 |
|---|---|
| **法院** | 犹他州第四司法区法院，犹他县（普若佛） |
| **案件编号** | **未经核实** — 新闻/聚合网站报道为 **260402353**，社区案件页面（截至 2026-06-03 唯一可访问的类原始来源页面）显示为 **260400253**。在依赖任一编号前，请先核对案件记录。 |
| **访问系统** | 犹他州法院 **XChange**（https://www.utcourts.gov/en/court-records-publications/records/court-records/coris.html）— 犹他州地区法院记录**不**在 PACER 上（PACER 为联邦系统）。XChange 通常需要注册账户，且可能收取费用。 |
| **需申请的文件类型** | 经核实的诉状（2026-05-27 提交）；临时限制令及初步禁令听证通知命令（约 2026-05-28 签发，法官 Tony F. Graf Jr.）；任何答辩状/回应性诉状；案件记录单。 |

> 犹他州地区法院案卷属于公开记录，但通常须通过 XChange 或亲赴书记员办公室方可查阅；在公开网络上无法进行全文自由检索。

## 社区/倡导类存档（非中立 — 使用前请核实）

以下第三方网站据报道托管或索引了相关案件材料。这些网站**立场倾向辩护方**，且在资料汇编期间**无法核实**其是否托管了官方案卷的经认证副本。仅供查找线索，不具权威性；任何文件均须与书记员记录交叉核对。

| 网站 | URL | 注意事项 |
|---|---|---|
| BAM Dispute Archive | https://bamsucks.com/ | 倾向辩护方的社区存档 |
| 案件页面 | https://johndoesthings2026.github.io/bricksminifigslawsuit/ | 社区页面；显示案件编号存在差异 |
| Salem Brick Trials | https://salembricktrials.com/ | 倾向辩护方的文件记录网站 |
| AFPD / Reckless Ben 时间线 | https://www.dreamthief.com/2026/05/the-afpd-reckless-ben-timeline.html | 倾向辩护方；包含警方记录及案卷链接 |

## 俄勒冈州相关事项（基础商业纠纷）

- Mansell 家族据报道在俄勒冈州小额索赔诉讼中获得**缺席判决**，并提起后续民事诉讼。俄勒冈州法院记录可通过 **Oregon eCourt / OJCIN**（https://www.courts.oregon.gov/services/online/Pages/ojcin.aspx）查阅。
- 据报道，**俄勒冈州基泽市**的一起刑事/警方调查正由**马里恩县地方检察官**审查。

## 下载文件后建议的本地目录结构

```
lawsuit/
  filings/
    2026-05-27_verified-complaint.pdf
    2026-05-28_tro-and-hearing-notice.pdf
    docket-sheet.pdf
    answer_<date>.pdf          # 如已/届时提交
  police/
    probable-cause-affidavit_2026-03-10.pdf
    search-warrant_2026-03-11.pdf
    search-warrant-return_2026-03-11.pdf
```

> 添加实际文件时，请在 `filings/` 目录内的简短 README 中注明每份文件的**来源**（所用系统/网站及检索日期），以确保存档可追溯。