# Relationship Graph Data

<!--
Canonical source for the /parties relationship graph. Edit here; never edit web/.generated/.
Direction: → directed (arrow at Target) · ↔ mutual (both ends) · — symmetric (no arrow).
Status: CONFIRMED | ALLEGATION (ALLEGATION renders dashed).
Icon: optional PUBLIC image URL — linked, never re-hosted. Only org/agency logos, public
emblems, or a self-publishing public figure's own channel avatar. NEVER a private citizen's
photo (the derive step drops + warns on any person icon not in the public-figure allowlist).
Role / Statement: optional short public captions for the node detail card.
-->

## Nodes

| Id | Label | Type | Side | Icon | Role | Statement |
|----|-------|------|------|------|------|-----------|
| bryan-mansell | Bryan Mansell | person | defendant |  | Collection owner / consignor | Acted with Schneider to recover the collection. |
| mansell-father | Mansell's father | person | neutral |  | Co-owner of the collection (~83) |  |
| chrystal-law-gorman | Chrystal Law-Gorman | person | neutral |  | Former franchise operator / signatory | Says the contract permitted consignment. |
| ben-gorman | Benjamin (Ben) Gorman | person | neutral |  | Former co-operator / spouse of Chrystal | Runs Not A Pipe Publishing; says BAM breached first. |
| ben-schneider | Reckless Ben (Schneider) | person | defendant | https://unavatar.io/youtube/RecklessBen | YouTuber / self-styled investigator | Says he went to serve papers; alleges police misconduct. |
| reckless-ben-llc | Reckless Ben LLC | org | defendant | https://unavatar.io/youtube/RecklessBen | Schneider's media/business entity |  |
| victor-nguyen | Victor Nguyen | person | defendant |  | Associate of Schneider (defendant) |  |
| bam-franchising | BAM Franchising | org | plaintiff | https://bricksandminifigs.com/wp-content/uploads/2025/04/cropped-BAM_mini_blue-192x192.png | Franchisor / corporate parent (plaintiff) | Denies theft/wrongdoing; offered mediation. |
| ammon-mcneff | Ammon McNeff | person | plaintiff |  | CEO, Bricks & Minifigs (plaintiff) | Publicly apologized; rejects theft/conspiracy claims. |
| matt-mcneff | Matt McNeff | person | plaintiff |  | COO / co-owner (plaintiff) |  |
| josh-johnson | Josh Johnson | person | plaintiff |  | Works for BAM as a corporate agent (FDD "franchise seller"), not a confirmed employee; criminal complainant | FDD lists him among BAM's "franchise sellers"; earlier "new owner / manager / employee" labels were inconsistent. |
| brandon-best | Brandon Best | person | plaintiff |  | Tied to store operation (plaintiff) |  |
| baker-bricks | Baker Bricks | org | plaintiff |  | Entity tied to the store operation (Best) | ⚠ Entity name varies in OR SOS records (community-reported "Salem-Baker Bricks Inc."); verify. |
| legally-mine | Legally Mine, LLC | org | neutral |  | Utah asset-protection firm formerly led by the McNeffs (per BAM FDD) |  |
| afpd | American Fork PD | agency | official | https://unavatar.io/youtube/AmericanForkPoliceDepartment | Municipal police agency | Released body-cam footage; defends its conduct. |
| cameron-paul | Cameron Paul | person | official |  | AFPD Chief (official capacity) | Authored the ~26-min department video statement. |
| mckay-valadez | McKay Valadez | person | official |  | AFPD officer (responding/charging) | Responded to the 03/10/2026 complaint, contacted Schneider at the scene, and authored the probable-cause statement charging him with stalking and targeted residential picketing (AFPD case 26AF02033). Transcribed from scanned AFPD records (OCR). |
| spencer-tonga | Spencer Tonga | person | official |  | AFPD officer | Submitted the probable-cause statement for Schneider's 03/11/2026 stalking arrest (case 26AF02066; written by Det. Nicosia); also the responding/reporting officer on the related trespassing report (case 26AF01974). Transcribed from scanned AFPD records (OCR). |
| det-nicosia | Det. Nicosia | person | official |  | AFPD detective | Authored the probable-cause statement for Schneider's 03/11/2026 stalking arrest (case 26AF02066), which Ofc. Tonga submitted. Transcribed from scanned AFPD records (OCR); first name not in the record. |
| cole-richardson | Cole G. Richardson | person | official |  | AFPD officer | Sworn affiant on the affidavit for the search warrant in Schneider's case (case 26AF02066), filed in Utah County's Fourth District Court. Transcribed from scanned AFPD records (OCR). |
| s-hawkins | S. Hawkins | person | official |  | AFPD officer (responding) | Responded to and authored the harassment report (case 26AF02007) over the residential activity that preceded Schneider's arrest. Transcribed from scanned AFPD records (OCR). |
| rj-bibeau | RJ Bibeau | person | official |  | AFPD officer (responding) | One of the officers who responded to the harassment complaint (case 26AF02007) tied to the residential-picketing activity. Transcribed from scanned AFPD records (OCR). |
| k-faughton | K. Faughton | person | official |  | AFPD officer (responding) | Responded to the harassment complaint (case 26AF02007). ⚠ Surname uncertain — transcribed from a scan (OCR). |
| g-mecham | G. Mecham | person | official |  | AFPD officer (responding) | Responded to the harassment complaint (case 26AF02007). ⚠ Surname uncertain — transcribed from a scan (OCR). |
| m-bishop | M. Bishop | person | official |  | AFPD officer (intake) | Logged/received the trespassing report (case 26AF01974) over the residential activity — an administrative intake role (possibly desk/dispatch). Transcribed from scanned AFPD records (OCR). |
| h-wood | H. Wood | person | official |  | AFPD officer (intake) | Logged/received the harassment report (case 26AF02007) — an administrative intake role (possibly desk/dispatch). Transcribed from scanned AFPD records (OCR). |

## Edges

| Source | Relationship | Target | Category | Direction | Status | Note |
|--------|--------------|--------|----------|-----------|--------|------|
| bryan-mansell | co-owns collection | mansell-father | familial | — | CONFIRMED |  |
| bryan-mansell | consigned collection to (Nov 2023) | chrystal-law-gorman | transactional | → | CONFIRMED |  |
| bam-franchising | removed / repossessed store | chrystal-law-gorman | corporate | → | CONFIRMED |  |
| bam-franchising | removed / repossessed store | ben-gorman | corporate | → | CONFIRMED |  |
| ben-gorman | married to | chrystal-law-gorman | familial | — | CONFIRMED |  |
| chrystal-law-gorman | sued (separate suit) | bam-franchising | legal | → | CONFIRMED | Breach of contract, conversion, defamation, civil conspiracy |
| ben-gorman | sued (separate suit) | bam-franchising | legal | → | CONFIRMED |  |
| ben-schneider | publicized dispute for | bryan-mansell | investigative | → | CONFIRMED |  |
| ben-schneider | owns | reckless-ben-llc | corporate | → | CONFIRMED |  |
| ben-schneider | associate | victor-nguyen | investigative | ↔ | CONFIRMED |  |
| ammon-mcneff | CEO of | bam-franchising | corporate | → | CONFIRMED |  |
| matt-mcneff | COO of | bam-franchising | corporate | → | CONFIRMED |  |
| ammon-mcneff | brothers | matt-mcneff | familial | — | CONFIRMED |  |
| ammon-mcneff | president of (2011–2020) | legally-mine | corporate | → | CONFIRMED | Per BAM FDD Item 2 "Business Experience" (state-regulator filing). |
| matt-mcneff | VP marketing of (2011–2020) | legally-mine | corporate | → | CONFIRMED | Per BAM FDD Item 2. |
| ammon-mcneff | served as missionaries together (2004) | josh-johnson | personal | — | ALLEGATION | Per a 2004 newspaper clipping surfaced by the community (see media/community-sources.md); paywalled — verify before relying. The professional tie below is the better-documented connection. |
| josh-johnson | franchise seller for | bam-franchising | corporate | → | CONFIRMED | FDD lists him as a BAM "franchise seller" — works for BAM as a corporate agent, though not a confirmed salaried employee. |
| josh-johnson | former employee of | legally-mine | corporate | → | ALLEGATION | Community-reported via the Wisconsin FDD (Exec. Event Booking Director, 2018–2020); not independently re-verified. |
| josh-johnson | tied to store operation | baker-bricks | corporate | → | ALLEGATION | Local-store role contested; the FDD lists him as a BAM corporate franchise seller, not a Baker Bricks principal. |
| brandon-best | operates | baker-bricks | corporate | → | CONFIRMED |  |
| afpd | arrested (Mar 2026) | ben-schneider | law-enforcement | → | CONFIRMED |  |
| afpd | executed search warrant | ben-schneider | law-enforcement | → | CONFIRMED | Return: no items seized |
| cameron-paul | chief of | afpd | corporate | → | CONFIRMED |  |
| mckay-valadez | officer at | afpd | corporate | → | CONFIRMED |  |
| spencer-tonga | officer at | afpd | corporate | → | CONFIRMED |  |
| det-nicosia | detective at | afpd | corporate | → | CONFIRMED |  |
| cole-richardson | officer at | afpd | corporate | → | CONFIRMED |  |
| s-hawkins | officer at | afpd | corporate | → | CONFIRMED |  |
| rj-bibeau | officer at | afpd | corporate | → | CONFIRMED |  |
| k-faughton | officer at | afpd | corporate | → | CONFIRMED | ⚠ Surname uncertain (OCR). |
| g-mecham | officer at | afpd | corporate | → | CONFIRMED | ⚠ Surname uncertain (OCR). |
| m-bishop | officer at | afpd | corporate | → | CONFIRMED |  |
| h-wood | officer at | afpd | corporate | → | CONFIRMED |  |
| mckay-valadez | probable-cause affiant vs | ben-schneider | law-enforcement | → | CONFIRMED | 03/10 PC statement (stalking; targeted residential picketing). Scanned AFPD records (OCR). |
| spencer-tonga | submitted PC statement vs | ben-schneider | law-enforcement | → | CONFIRMED | 03/11 stalking PC statement. Scanned AFPD records (OCR). |
| det-nicosia | wrote PC statement vs | ben-schneider | law-enforcement | → | CONFIRMED | 03/11 stalking PC statement. Scanned AFPD records (OCR). |
| cole-richardson | search-warrant affiant vs | ben-schneider | law-enforcement | → | CONFIRMED | Affidavit for search warrant. Scanned AFPD records (OCR). |
| josh-johnson | criminal complainant vs | ben-schneider | legal | → | CONFIRMED |  |
| bam-franchising | sued | ben-schneider | legal | → | CONFIRMED | Case no. unverified (260402353 / 260400253) |
| bam-franchising | sued | reckless-ben-llc | legal | → | CONFIRMED |  |
| bam-franchising | sued | bryan-mansell | legal | → | CONFIRMED |  |
| bam-franchising | sued | victor-nguyen | legal | → | CONFIRMED |  |
| bryan-mansell | alleges collection not returned | bam-franchising | legal | → | ALLEGATION |  |
