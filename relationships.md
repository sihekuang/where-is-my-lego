# Relationship Graph Data

<!--
Canonical source for the /parties relationship graph. Edit here; never edit web/.generated/.
Direction: → directed (arrow at Target) · ↔ mutual (both ends) · — symmetric (no arrow).
Status: CONFIRMED | ALLEGATION (ALLEGATION renders dashed).
Icon: optional PUBLIC image URL — linked, never re-hosted. Only org/agency logos, public
emblems, or a self-publishing public figure's own channel avatar. NEVER a private citizen's
photo (the derive step drops + warns on any person icon not in the public-figure allowlist).
The graph draws icons on a <canvas> (crossOrigin=anonymous), so the host MUST send CORS headers
(Access-Control-Allow-Origin) or the icon silently falls back to initials. A logo on a non-CORS
host is routed through an image proxy (e.g. images.weserv.nl/?url=…) so it can load — still a
link to the original, never re-hosted.
Role / Statement: optional short public captions for the node detail card.
Fig: OPTIONAL minifig avatar code for the graph (people only). Tokens, any order:
group p|b|c (police/biz/civilian) · gender m|f · age y|a|e (young/adult/elder). Missing axes
default (group from Side, gender m, age a); blank renders the default figure. Avatar-only — asserts
nothing about the case; never a real likeness.
-->

## Nodes

| Id | Label | Type | Side | Icon | Role | Statement | Fig |
|----|-------|------|------|------|------|-----------|-----|
| bryan-mansell | Bryan Mansell | person | defendant |  | Collection owner / consignor | Acted with Schneider to recover the collection. | cma |
| mansell-father | Mansell's father | person | neutral |  | Co-owner of the collection (~83) |  | cme |
| chrystal-law-gorman | Chrystal Law-Gorman | person | neutral |  | Former franchise operator / signatory | Says the contract permitted consignment. | cfa |
| ben-gorman | Benjamin (Ben) Gorman | person | neutral |  | Former co-operator / spouse of Chrystal | Runs Not A Pipe Publishing; says BAM breached first. | cma |
| ben-schneider | Reckless Ben (Schneider) | person | defendant | https://unavatar.io/youtube/RecklessBen | YouTuber / self-styled investigator | Says he went to serve papers; alleges police misconduct. |  |
| reckless-ben-llc | Reckless Ben LLC | org | defendant | https://unavatar.io/youtube/RecklessBen | Schneider's media/business entity |  |  |
| victor-nguyen | Victor Nguyen | person | defendant |  | Associate of Schneider (defendant) |  | cma |
| bam-franchising | BAM Franchising | org | plaintiff | https://images.weserv.nl/?url=bricksandminifigs.com/wp-content/uploads/2025/04/cropped-BAM_mini_blue-192x192.png | Franchisor / corporate parent (plaintiff) | Denies theft/wrongdoing; offered mediation. |  |
| ammon-mcneff | Ammon McNeff | person | plaintiff |  | CEO, Bricks & Minifigs (plaintiff) | Publicly apologized; rejects theft/conspiracy claims. | bma |
| matt-mcneff | Matt McNeff | person | plaintiff |  | COO / co-owner (plaintiff) |  | bma |
| josh-johnson | Josh Johnson | person | plaintiff |  | Works for BAM as a corporate agent (FDD "franchise seller"), not a confirmed employee; criminal complainant | FDD lists him among BAM's "franchise sellers"; earlier "new owner / manager / employee" labels were inconsistent. Jun 4, 2026: BAM "parted ways" with him (mutual separation) and closed the Salem store; still a named plaintiff. | bma |
| brandon-best | Brandon Best | person | plaintiff |  | Tied to store operation (plaintiff) | Jun 4, 2026: BAM "parted ways" with him (mutual separation) and permanently closed the Salem store; still a named plaintiff. (Spelled "Brandon," not "Brendon.") | bma |
| baker-bricks | Baker Bricks | org | plaintiff |  | Entity tied to the store operation (Best) | ⚠ Named "Baker Bricks, LLC" in the suit; OR SOS shows "Salem-Baker Bricks Inc." (Brandon Best, Pres/Sec; reg. 2332041-97) at the former store's Keizer address — admin-dissolved Jan 2026. Salem store permanently closed by BAM Jun 4, 2026. |  |
| legally-mine | Legally Mine, LLC | org | neutral |  | Utah asset-protection firm; Ammon (Pres.) & Matt (VP Mktg) McNeff held roles here 2011–2020 (per BAM FDD) | ⚠ The 2025 Ohio Supreme Court UPL finding (Case 2025-0037) names a *different* McNeff — **Daniel** — as its sole member/manager; don't conflate with Ammon/Matt. |  |
| daniel-mcneff | Daniel McNeff | person | neutral |  | Legally Mine sole member/manager | Co-debtor (with Legally Mine) on a 2021 settlement/note owed to Ammon & Matt McNeff; UPL respondent (Ohio 2025-0037). | bma |
| john-masek | John Masek | person | neutral |  | Secured creditor of Legally Mine | Holds a security interest in Legally Mine's 450,000 BAM Franchising shares (2020 Utah UCC-1). | bma |
| david-ortiz | David Ortiz | person | neutral |  | Secured creditor of Legally Mine; BAM franchise seller | Co-secured-party (with Masek) on Legally Mine's 450k BAM shares; listed among BAM's "franchise sellers" (FDD). | bma |
| afpd | American Fork PD | agency | official | https://unavatar.io/youtube/AmericanForkPoliceDepartment | Municipal police agency | Released body-cam footage; defends its conduct. |  |
| cameron-paul | Cameron Paul | person | official |  | AFPD Chief (official capacity) | Authored the ~26-min department video statement. | pma |
| mckay-valadez | McKay Valadez | person | official |  | AFPD officer (responding/charging) | Responded to the 03/10/2026 complaint, contacted Schneider at the scene, and authored the probable-cause statement charging him with stalking and targeted residential picketing (AFPD case 26AF02033). Transcribed from scanned AFPD records (OCR). | pma |
| spencer-tonga | Spencer Tonga | person | official |  | AFPD officer | Submitted the probable-cause statement for Schneider's 03/11/2026 stalking arrest (case 26AF02066; written by Det. Nicosia); also the responding/reporting officer on the related trespassing report (case 26AF01974). Transcribed from scanned AFPD records (OCR). | pma |
| det-nicosia | Det. Nicosia | person | official |  | AFPD detective | Authored the probable-cause statement for Schneider's 03/11/2026 stalking arrest (case 26AF02066), which Ofc. Tonga submitted. Transcribed from scanned AFPD records (OCR); first name not in the record. | pma |
| cole-richardson | Cole G. Richardson | person | official |  | AFPD officer | Sworn affiant on the affidavit for the search warrant in Schneider's case (case 26AF02066), filed in Utah County's Fourth District Court. Transcribed from scanned AFPD records (OCR). | pma |
| s-hawkins | S. Hawkins | person | official |  | AFPD officer (responding) | Responded to and authored the harassment report (case 26AF02007) over the residential activity that preceded Schneider's arrest. Transcribed from scanned AFPD records (OCR). | pma |
| rj-bibeau | RJ Bibeau | person | official |  | AFPD officer (responding) | One of the officers who responded to the harassment complaint (case 26AF02007) tied to the residential-picketing activity. Transcribed from scanned AFPD records (OCR). | pma |
| k-faughton | K. Faughton | person | official |  | AFPD officer (responding) | Responded to the harassment complaint (case 26AF02007). ⚠ Surname uncertain — transcribed from a scan (OCR). | pma |
| g-mecham | G. Mecham | person | official |  | AFPD officer (responding) | Responded to the harassment complaint (case 26AF02007). ⚠ Surname uncertain — transcribed from a scan (OCR). | pma |
| m-bishop | M. Bishop | person | official |  | AFPD officer (intake) | Logged/received the trespassing report (case 26AF01974) over the residential activity — an administrative intake role (possibly desk/dispatch). Transcribed from scanned AFPD records (OCR). | pma |
| h-wood | H. Wood | person | official |  | AFPD officer (intake) | Logged/received the harassment report (case 26AF02007) — an administrative intake role (possibly desk/dispatch). Transcribed from scanned AFPD records (OCR). | pma |

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
| daniel-mcneff | sole member/manager of | legally-mine | corporate | → | CONFIRMED | Per the Ohio Sup. Ct. UPL order (2025-0037) and the 2021 Utah UCC-1. |
| legally-mine | holds 450k shares of | bam-franchising | corporate | → | CONFIRMED | Pledged as collateral in a 2020 Utah UCC-1 (file 200810703927-7) — i.e. Legally Mine owns BAM stock. |
| legally-mine | pledged BAM shares to (secured) | john-masek | transactional | → | CONFIRMED | 2020 UCC-1: 450k BAM Franchising shares as collateral. |
| legally-mine | pledged BAM shares to (secured) | david-ortiz | transactional | → | CONFIRMED | 2020 UCC-1: 450k BAM Franchising shares as collateral. |
| david-ortiz | franchise seller for | bam-franchising | corporate | → | CONFIRMED | Listed among BAM's "franchise sellers" in the FDD. |
| ammon-mcneff | 2021 settlement creditor of | daniel-mcneff | legal | → | CONFIRMED | $1,728,000 settlement/note secured by 21% of Legally Mine (UCC 210216749881-3); resolves McNeff v. McNeff (D. Utah 2:21-cv-00048). |
| matt-mcneff | 2021 settlement creditor of | daniel-mcneff | legal | → | CONFIRMED | Same 2021 settlement/note (co-secured party). |
| ammon-mcneff | served as missionaries together (2004) | josh-johnson | personal | — | ALLEGATION | Per a 2004 newspaper clipping surfaced by the community (see media/community-sources.md); paywalled — verify before relying. The professional tie below is the better-documented connection. |
| josh-johnson | franchise seller for | bam-franchising | corporate | → | CONFIRMED | FDD lists him as a BAM "franchise seller" — works for BAM as a corporate agent, though not a confirmed salaried employee. |
| josh-johnson | former employee of | legally-mine | corporate | → | ALLEGATION | Community-reported via the Wisconsin FDD (Exec. Event Booking Director, 2018–2020); not independently re-verified. |
| josh-johnson | tied to store operation | baker-bricks | corporate | → | ALLEGATION | Local-store role contested; the FDD lists him as a BAM corporate franchise seller, not a Baker Bricks principal. |
| brandon-best | operates | baker-bricks | corporate | → | CONFIRMED |  |
| bam-franchising | parted ways with (Jun 4, 2026) | josh-johnson | corporate | → | CONFIRMED | BAM-described mutual separation; Salem store permanently closed. Both remain named plaintiffs. |
| bam-franchising | parted ways with (Jun 4, 2026) | brandon-best | corporate | → | CONFIRMED | BAM-described mutual separation; Salem store permanently closed. Both remain named plaintiffs. |
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
