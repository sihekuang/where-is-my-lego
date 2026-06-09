// Dependency-free JSON-LD builders + content data.
//
// Kept as plain `.mjs` (no `@/` aliases, no React, no `next` imports) so that:
//   1. node can unit-test the pure shapes directly (scripts/structured-data.test.mjs), and
//   2. lib/structured-data.ts can import them and inject SITE_URL / locale at render time.
//
// Everything here is NEUTRAL by construction: the FAQ restates the canonical, sourced
// README summary, keeps the "~$200,000" figure flagged as disputed, and preserves the
// "no court has found any party liable" disclaimer. Nothing is asserted as adjudicated fact.

/**
 * Frequently-asked questions, drawn verbatim-in-substance from the root README summary.
 * Each answer mirrors the archive's hedging (denies / disputed / unproven / no court has ruled).
 */
export const FAQ_ITEMS = [
  {
    q: "What is the Bricks & Minifigs (BAM) – “Reckless Ben” controversy?",
    a:
      "It is a public dispute over a LEGO Star Wars collection — about 780 sets, family-valued at " +
      "roughly $200,000 (a figure BAM disputes) — that a collector and his elderly father consigned " +
      "in 2023 to a Bricks & Minifigs franchise in the Salem/Keizer, Oregon area. A signed contract said " +
      "any unsold sets stayed the family's property; the family says the collection was never returned, " +
      "while BAM denies any theft. The fight escalated into a viral YouTube investigation, two arrests, a " +
      "police-conduct controversy, and a 13-count civil lawsuit in Utah. No court has found any party liable.",
  },
  {
    q: "Who is “Reckless Ben”?",
    a:
      "Benjamin “Reckless Ben” Schneider is a YouTuber who posted a viral video (~3 million views) " +
      "about the missing collection and raised six figures on a GoFundMe for the family. He traveled to " +
      "American Fork, Utah, where he was arrested twice in March 2026 on misdemeanor charges; he says he was " +
      "there to serve civil papers. He is among the defendants in BAM's Utah lawsuit. The two arrests are " +
      "documented; their exact dates are reported differently across outlets.",
  },
  {
    q: "What is the lawsuit about?",
    a:
      "On May 27, 2026, BAM Franchising and associated individuals sued Schneider and others in Utah Fourth " +
      "District Court (case no. 260402353, Judge Tony F. Graf Jr.), raising 13 causes of action — " +
      "including a Utah “pattern of unlawful activity” (RICO) claim, defamation per se, civil stalking, " +
      "and trespass — and framing the campaign as a “coordinated, viral extortion.” The defendants " +
      "reject that framing. These are unproven allegations; no court has ruled on them.",
  },
  {
    q: "Is the LEGO collection really worth $200,000?",
    a:
      "The ~$200,000 figure is family-valued and disputed. BAM has called it “promotional” and " +
      "re-valued the collection at roughly $95,000–$100,000, while an earlier inventory estimate put it " +
      "around $60,000–$98,000. This archive preserves the disputed figure rather than treating any single " +
      "number as settled.",
  },
  {
    q: "Has anyone been found guilty or liable?",
    a:
      "No. As of the latest update, no court has found any party liable in the civil case, and the criminal " +
      "matter remains pending. Every substantive claim in this archive is labeled Confirmed or Allegation, and " +
      "contested or single-sourced details are flagged.",
  },
];

/** schema.org FAQPage from {q, a} pairs (defaults to the archive FAQ above). */
export function faqPageJsonLd({ items = FAQ_ITEMS } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/**
 * schema.org BreadcrumbList from an ordered trail of { name, item? }.
 * `item` (an absolute URL) is omitted for the last crumb (the current page), per Google guidance.
 */
export function breadcrumbItemList(trail) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(({ name, item }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      ...(item ? { item } : {}),
    })),
  };
}

/**
 * schema.org Dataset for a structured view (e.g. the timeline). Always free to access.
 * `publisher` is inlined (not an @id ref) so the node is self-contained on its own page.
 */
export function datasetJsonLd({
  name,
  description,
  url,
  inLanguage,
  temporalCoverage,
  dateModified,
  keywords,
  publisher,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url,
    inLanguage,
    isAccessibleForFree: true,
    ...(temporalCoverage ? { temporalCoverage } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(keywords ? { keywords } : {}),
    ...(publisher ? { creator: publisher, publisher } : {}),
  };
}
