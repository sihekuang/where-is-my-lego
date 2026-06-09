// Usage: node scripts/verify-seo.mjs [baseUrl]
// Asserts the SEO surface against a RUNNING server. Exits non-zero on failure.
import assert from "node:assert/strict";

const SERVER = process.argv[2] ?? "http://localhost:3300";
const CANON = "https://www.whereismylego.com";
const get = async (p) => {
  const res = await fetch(`${SERVER}${p}`);
  assert.equal(res.status, 200, `${p} should be 200`);
  return res.text();
};

// root "/" redirects to the default locale
const root = await fetch(`${SERVER}/`, { redirect: "manual" });
assert.ok([301, 302, 307, 308].includes(root.status), `/ should redirect (got ${root.status})`);
assert.match(root.headers.get("location") ?? "", /\/en$/, "/ redirects to /en");

// locale-resolution redirects: a locale-less or wrong-locale URL → the default-locale equivalent
const redirectsTo = async (from, toSuffix) => {
  const res = await fetch(`${SERVER}${from}`, { redirect: "manual" });
  assert.ok([301, 302, 307, 308].includes(res.status), `${from} should redirect (got ${res.status})`);
  assert.match(res.headers.get("location") ?? "", new RegExp(`${toSuffix}$`), `${from} → ${toSuffix}`);
};
await redirectsTo("/timeline", "/en/timeline"); // locale-less known route
await redirectsTo("/lawsuit/documents", "/en/lawsuit/documents"); // nested locale-less route
await redirectsTo("/fr/timeline", "/en/timeline"); // wrong locale in front of a known route

// genuinely-unknown URLs return a real 404 (NOT a soft-404 redirect) with a link back home
for (const p of ["/totally-made-up", "/en/totally-made-up"]) {
  const res = await fetch(`${SERVER}${p}`, { redirect: "manual" });
  assert.equal(res.status, 404, `${p} should be a real 404 (got ${res.status})`);
  assert.match(await res.text(), /href="\/en"/, `${p} 404 page links to /en`);
}

// robots.txt
const robots = await get("/robots.txt");
assert.match(robots, /User-Agent:\s*\*/i, "robots names a user-agent");
assert.match(robots, /Allow:\s*\//i, "robots allows /");
assert.match(robots, new RegExp(`Sitemap:\\s*${CANON}/sitemap.xml`), "robots references sitemap");

// sitemap.xml — both locales for home + a content route, plus hreflang alternates
const sitemap = await get("/sitemap.xml");
for (const path of ["/en", "/zh-Hans", "/en/timeline", "/zh-Hans/timeline", "/en/disclaimer", "/zh-Hans/disclaimer"]) {
  assert.ok(sitemap.includes(`${CANON}${path}<`), `sitemap lists ${CANON}${path}`);
}
assert.match(sitemap, /hreflang="en"/, "sitemap has hreflang en");
assert.match(sitemap, /hreflang="zh-Hans"/, "sitemap has hreflang zh-Hans");
assert.match(sitemap, /hreflang="x-default"/, "sitemap has hreflang x-default");

// manifest
const manifest = JSON.parse(await get("/manifest.webmanifest"));
assert.equal(manifest.short_name, "Where Is My Lego", "manifest short_name");

// default-locale home <head>: canonical + hreflang + OG + twitter + website JSON-LD
const home = await get("/en");
assert.match(home, new RegExp(`<link rel="canonical" href="${CANON}/en"`), "home canonical");
// Next renders the attribute as `hrefLang` (camelCase) in HTML; match case-insensitively.
assert.match(home, new RegExp(`hreflang="en" href="${CANON}/en"`, "i"), "home hreflang en");
assert.match(home, new RegExp(`hreflang="zh-Hans" href="${CANON}/zh-Hans"`, "i"), "home hreflang zh-Hans");
assert.match(home, new RegExp(`hreflang="x-default" href="${CANON}/en"`, "i"), "home hreflang x-default");
assert.match(home, /property="og:locale" content="en_US"/, "home og:locale en_US");
assert.match(home, /property="og:title"/, "home og:title");
assert.match(home, /property="og:image"/, "home og:image");
assert.match(home, /name="twitter:card" content="summary_large_image"/, "twitter card");
assert.match(home, /"@type":"WebSite"/, "home WebSite JSON-LD");
assert.match(home, /"@type":"Organization"/, "home Organization JSON-LD");
assert.match(home, /<html lang="en"/, "home html lang en");
// neutral subject entity (referenced by every Article's `about`) ships site-wide via the layout
assert.match(home, new RegExp(`"@id":"${CANON}/#subject"`), "subject entity @id present");
assert.match(home, /"@type":"Thing"/, "subject entity is a Thing (a topic, not a verdict)");
// FAQPage on the home page, with neutral sourced Q&A
assert.match(home, /"@type":"FAQPage"/, "home FAQPage JSON-LD");
assert.match(home, /"@type":"Question"/, "home FAQ has Questions");
assert.match(home, /"@type":"Answer"/, "home FAQ has Answers");

// a content page (default locale): unique canonical/title + Article + BreadcrumbList JSON-LD + hreflang
const timeline = await get("/en/timeline");
assert.match(timeline, new RegExp(`<link rel="canonical" href="${CANON}/en/timeline"`), "timeline canonical");
assert.match(timeline, /<title>Timeline · Where Is My Lego<\/title>/, "timeline templated title");
assert.match(timeline, new RegExp(`hreflang="zh-Hans" href="${CANON}/zh-Hans/timeline"`, "i"), "timeline hreflang zh-Hans");
assert.match(timeline, /"@type":"Article"/, "timeline Article JSON-LD");
assert.match(timeline, /"@type":"BreadcrumbList"/, "timeline BreadcrumbList JSON-LD");
assert.match(timeline, /name="twitter:card" content="summary_large_image"/, "content page large twitter card");
// Article enrichment: free-to-read, keyworded, and tied to the subject entity
assert.match(timeline, /"isAccessibleForFree":true/, "Article isAccessibleForFree");
assert.match(timeline, /"keywords":\[/, "Article keywords");
assert.match(timeline, new RegExp(`"about":\\{"@id":"${CANON}/#subject"\\}`), "Article about → subject");
// Dataset JSON-LD for the timeline view
assert.match(timeline, /"@type":"Dataset"/, "timeline Dataset JSON-LD");
assert.match(timeline, /"temporalCoverage":"2023-11\/2026-06"/, "Dataset temporal coverage");

// non-default locale: localized canonical, lang attribute, og:locale, and inLanguage in JSON-LD
const zh = await get("/zh-Hans/timeline");
assert.match(zh, new RegExp(`<link rel="canonical" href="${CANON}/zh-Hans/timeline"`), "zh canonical");
assert.match(zh, /<html lang="zh-Hans"/, "zh html lang");
assert.match(zh, /property="og:locale" content="zh_CN"/, "zh og:locale zh_CN");
assert.match(zh, /"inLanguage":"zh-Hans"/, "zh Article inLanguage");

// a nested route: 3-level BreadcrumbList JSON-LD + a matching visible breadcrumb nav
const docs = await get("/en/lawsuit/documents");
assert.match(docs, /"@type":"BreadcrumbList"/, "docs BreadcrumbList JSON-LD");
assert.match(docs, /"position":3/, "docs breadcrumb is 3 levels deep");
assert.match(docs, new RegExp(`"item":"${CANON}/en/lawsuit"`), "docs breadcrumb links its Lawsuit parent");
assert.match(docs, /<nav aria-label="Breadcrumb"/, "docs renders a visible breadcrumb nav");

// per-page OG image route exists for each locale
for (const p of ["/en/timeline/opengraph-image", "/zh-Hans/timeline/opengraph-image"]) {
  const og = await fetch(`${SERVER}${p}`);
  assert.equal(og.status, 200, `${p} 200`);
  assert.match(og.headers.get("content-type") ?? "", /image\/png/, `${p} is png`);
}

console.log("verify-seo: all assertions passed");
