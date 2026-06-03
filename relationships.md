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
| ben-schneider | Reckless Ben (Schneider) | person | defendant | https://unavatar.io/youtube/RecklessBen | YouTuber / self-styled investigator | Says he went to serve papers; alleges police misconduct. |
| reckless-ben-llc | Reckless Ben LLC | org | defendant | https://unavatar.io/youtube/RecklessBen | Schneider's media/business entity |  |
| victor-nguyen | Victor Nguyen | person | defendant |  | Associate of Schneider (defendant) |  |
| bam-franchising | BAM Franchising | org | plaintiff | https://www.google.com/s2/favicons?domain=bricksandminifigs.com&sz=128 | Franchisor / corporate parent (plaintiff) | Denies theft/wrongdoing; offered mediation. |
| ammon-mcneff | Ammon McNeff | person | plaintiff |  | CEO, Bricks & Minifigs (plaintiff) | Publicly apologized; rejects theft/conspiracy claims. |
| matt-mcneff | Matt McNeff | person | plaintiff |  | COO / co-owner (plaintiff) |  |
| josh-johnson | Josh Johnson | person | plaintiff |  | Tied to store op; criminal complainant | Role wording inconsistent across outlets. |
| brandon-best | Brandon Best | person | plaintiff |  | Tied to store operation (plaintiff) |  |
| baker-bricks | Baker Bricks | org | plaintiff |  | Entity tied to the store operation |  |
| afpd | American Fork PD | agency | official | https://www.google.com/s2/favicons?domain=americanfork.gov&sz=128 | Municipal police agency | Released body-cam footage; defends its conduct. |
| cameron-paul | Cameron Paul | person | official |  | AFPD Chief (official capacity) | Authored the ~26-min department video statement. |
| bronson-kitchen | Bronson Kitchen | person | official |  | AFPD detective (separate incident) |  |

## Edges

| Source | Relationship | Target | Category | Direction | Status | Note |
|--------|--------------|--------|----------|-----------|--------|------|
| bryan-mansell | co-owns collection | mansell-father | familial | — | CONFIRMED |  |
| bryan-mansell | consigned collection to (Nov 2023) | chrystal-law-gorman | transactional | → | CONFIRMED |  |
| bam-franchising | removed / repossessed store | chrystal-law-gorman | corporate | → | CONFIRMED |  |
| ben-schneider | publicized dispute for | bryan-mansell | investigative | → | CONFIRMED |  |
| ben-schneider | owns | reckless-ben-llc | corporate | → | CONFIRMED |  |
| ben-schneider | associate | victor-nguyen | investigative | ↔ | CONFIRMED |  |
| ammon-mcneff | CEO of | bam-franchising | corporate | → | CONFIRMED |  |
| matt-mcneff | COO of | bam-franchising | corporate | → | CONFIRMED |  |
| ammon-mcneff | brothers | matt-mcneff | familial | — | CONFIRMED |  |
| josh-johnson | tied to store operation | baker-bricks | corporate | → | ALLEGATION |  |
| brandon-best | operates | baker-bricks | corporate | → | CONFIRMED |  |
| afpd | arrested (Mar 2026) | ben-schneider | law-enforcement | → | CONFIRMED |  |
| afpd | executed search warrant | ben-schneider | law-enforcement | → | CONFIRMED | Return: no items seized |
| cameron-paul | chief of | afpd | corporate | → | CONFIRMED |  |
| bronson-kitchen | detective at | afpd | corporate | → | CONFIRMED |  |
| josh-johnson | criminal complainant vs | ben-schneider | legal | → | CONFIRMED |  |
| bam-franchising | sued | ben-schneider | legal | → | CONFIRMED | Case No. 260402353 |
| bam-franchising | sued | reckless-ben-llc | legal | → | CONFIRMED |  |
| bam-franchising | sued | bryan-mansell | legal | → | CONFIRMED |  |
| bam-franchising | sued | victor-nguyen | legal | → | CONFIRMED |  |
| bryan-mansell | alleges collection not returned | bam-franchising | legal | → | ALLEGATION |  |
