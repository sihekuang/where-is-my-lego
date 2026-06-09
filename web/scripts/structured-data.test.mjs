// Unit tests for the dependency-free JSON-LD builders in lib/structured-data-extras.mjs.
// These are pure data/shape functions (no `@/` aliases, no React) so node can import them
// directly; the *rendered* JSON-LD is covered end-to-end by scripts/verify-seo.mjs.
import assert from "node:assert/strict";
import {
  FAQ_ITEMS,
  faqPageJsonLd,
  breadcrumbItemList,
  datasetJsonLd,
} from "../lib/structured-data-extras.mjs";

// --- FAQ_ITEMS: sourced Q&A that preserves the archive's neutrality ---
assert.ok(Array.isArray(FAQ_ITEMS) && FAQ_ITEMS.length >= 3, "FAQ has at least 3 items");
for (const it of FAQ_ITEMS) {
  assert.ok(typeof it.q === "string" && it.q.trim().length > 0, "each FAQ item has a question");
  assert.ok(typeof it.a === "string" && it.a.trim().length > 0, "each FAQ item has an answer");
}
// the disputed-value framing must survive (never launder ~$200K into a settled fact)
const valueItem = FAQ_ITEMS.find((it) => /\$200,?000|worth|valued/i.test(it.q + it.a));
assert.ok(valueItem, "a FAQ item addresses the collection's value");
assert.match(valueItem.a, /disput|family-valued/i, "the value answer flags the figure as disputed");
// the core disclaimer is preserved, and nothing is stated as adjudicated guilt
assert.ok(FAQ_ITEMS.some((it) => /no court/i.test(it.a)), "FAQ preserves a 'no court' neutrality note");
for (const it of FAQ_ITEMS) {
  assert.ok(!/\bguilty\b/i.test(it.a), "no answer asserts guilt");
}

// --- faqPageJsonLd: schema.org FAQPage shape ---
const faq = faqPageJsonLd();
assert.equal(faq["@context"], "https://schema.org", "faq @context");
assert.equal(faq["@type"], "FAQPage", "faq @type");
assert.equal(faq.mainEntity.length, FAQ_ITEMS.length, "one Question per item");
assert.equal(faq.mainEntity[0]["@type"], "Question", "first entry is a Question");
assert.equal(faq.mainEntity[0].name, FAQ_ITEMS[0].q, "Question name = q");
assert.equal(faq.mainEntity[0].acceptedAnswer["@type"], "Answer", "acceptedAnswer is an Answer");
assert.equal(faq.mainEntity[0].acceptedAnswer.text, FAQ_ITEMS[0].a, "Answer text = a");

// --- breadcrumbItemList: 1..n positions, absolute item URLs, leaf may omit the URL ---
const bc = breadcrumbItemList([
  { name: "Overview", item: "https://x/en" },
  { name: "Lawsuit", item: "https://x/en/lawsuit" },
  { name: "Court Documents" }, // leaf, current page — no url
]);
assert.equal(bc["@type"], "BreadcrumbList", "breadcrumb type");
assert.equal(bc.itemListElement.length, 3, "3 crumbs");
assert.deepEqual(bc.itemListElement.map((e) => e.position), [1, 2, 3], "positions are 1..n");
assert.equal(bc.itemListElement[0]["@type"], "ListItem", "crumbs are ListItems");
assert.equal(bc.itemListElement[0].item, "https://x/en", "first crumb keeps its url");
assert.equal(bc.itemListElement[2].name, "Court Documents", "leaf name preserved");
assert.ok(!("item" in bc.itemListElement[2]), "leaf omits its own url (current page)");

// --- datasetJsonLd: Dataset shape + free-access + temporal coverage ---
const ds = datasetJsonLd({
  name: "Timeline",
  description: "Chronological record of the dispute.",
  url: "https://x/en/timeline",
  inLanguage: "en",
  temporalCoverage: "2023-11/2026-06",
  dateModified: "2026-06-09T00:00:00.000Z",
  keywords: ["Bricks & Minifigs", "Reckless Ben"],
  publisher: { "@type": "Organization", name: "Where Is My Lego", url: "https://x/" },
});
assert.equal(ds["@context"], "https://schema.org", "dataset @context");
assert.equal(ds["@type"], "Dataset", "dataset @type");
assert.equal(ds.isAccessibleForFree, true, "dataset is free to access");
assert.equal(ds.temporalCoverage, "2023-11/2026-06", "dataset temporal coverage");
assert.equal(ds.inLanguage, "en", "dataset inLanguage");
assert.deepEqual(ds.keywords, ["Bricks & Minifigs", "Reckless Ben"], "dataset keywords");
assert.equal(ds.publisher.name, "Where Is My Lego", "dataset publisher inlined");
// optional fields are omitted (not emitted as undefined) when absent
const dsMin = datasetJsonLd({ name: "X", description: "Y", url: "https://x/en/timeline", inLanguage: "en" });
assert.ok(!("temporalCoverage" in dsMin), "temporalCoverage omitted when not given");
assert.ok(!("dateModified" in dsMin), "dateModified omitted when not given");

console.log("structured-data: all assertions passed");
