# Court Documents — How to Obtain the Primary Filings

This environment had **no outbound network access**, so the actual court PDFs could **not** be
downloaded into the repository. This file tells you exactly how and where to obtain the authoritative
public records. Use the [`../media/download_manifest.md`](../media/download_manifest.md) helper from an
unrestricted machine to pull copies.

## Authoritative primary source

| Field | Value |
|---|---|
| **Court** | Utah Fourth Judicial District Court, Utah County (Provo) |
| **Case No.** | **Unverified** — reported as **260402353** (news/aggregators) vs **260400253** (community case page, the only primary-style page reachable as of 2026-06-03). Confirm against the docket before relying on either. |
| **Access system** | Utah State Courts **XChange** (https://www.utcourts.gov/en/court-records-publications/records/court-records/coris.html) — Utah district-court records are *not* on PACER (PACER is federal). XChange generally requires an account and may charge fees. |
| **Document types to request** | Verified Complaint (filed 2026-05-27); TRO + order setting preliminary-injunction hearing (signed ~2026-05-28, Judge Tony F. Graf Jr.); any answer/responsive pleadings; docket sheet. |

> Utah district-court filings are public records but are typically accessed via XChange or in person at
> the clerk's office; they are not freely full-text searchable on the open web.

## Community / advocacy archives (NOT neutral — verify before relying)

These third-party sites reportedly host or index case materials. They are **defense-aligned** and were
**not verifiable** during compilation as hosting an authenticated copy of the official filing. Treat as
leads, not authority; always cross-check any document against the clerk's record.

| Site | URL | Caveat |
|---|---|---|
| BAM Dispute Archive | https://bamsucks.com/ | Defense-aligned community archive |
| Case page | https://johndoesthings2026.github.io/bricksminifigslawsuit/ | Community page; shows case-number discrepancy |
| Salem Brick Trials | https://salembricktrials.com/ | Defense-aligned documentation site |
| AFPD / Reckless Ben timeline | https://www.dreamthief.com/2026/05/the-afpd-reckless-ben-timeline.html | Defense-aligned; links police records & filings |

## Oregon side (underlying business dispute)

- The Mansell family reportedly obtained a **default judgment** in an Oregon small-claims action, with
  follow-up civil litigation. Oregon court records are accessible via **Oregon eCourt / OJCIN**
  (https://www.courts.oregon.gov/services/online/Pages/ojcin.aspx).
- A criminal/police investigation in **Keizer, Oregon** was reportedly under review by the **Marion
  County District Attorney**.

## Suggested local layout once you download them

```
lawsuit/
  filings/
    2026-05-27_verified-complaint.pdf
    2026-05-28_tro-and-hearing-notice.pdf
    docket-sheet.pdf
    answer_<date>.pdf          # if/when filed
  police/
    probable-cause-affidavit_2026-03-10.pdf
    search-warrant_2026-03-11.pdf
    search-warrant-return_2026-03-11.pdf
```

> When you add real documents, note their **provenance** (which system/site, retrieval date) in a
> short README inside `filings/` so the archive stays auditable.
