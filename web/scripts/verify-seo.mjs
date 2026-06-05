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

// a content page (default locale): unique canonical/title + Article + BreadcrumbList JSON-LD + hreflang
const timeline = await get("/en/timeline");
assert.match(timeline, new RegExp(`<link rel="canonical" href="${CANON}/en/timeline"`), "timeline canonical");
assert.match(timeline, /<title>Timeline · Where Is My Lego<\/title>/, "timeline templated title");
assert.match(timeline, new RegExp(`hreflang="zh-Hans" href="${CANON}/zh-Hans/timeline"`, "i"), "timeline hreflang zh-Hans");
assert.match(timeline, /"@type":"Article"/, "timeline Article JSON-LD");
assert.match(timeline, /"@type":"BreadcrumbList"/, "timeline BreadcrumbList JSON-LD");
assert.match(timeline, /name="twitter:card" content="summary_large_image"/, "content page large twitter card");

// non-default locale: localized canonical, lang attribute, og:locale, and inLanguage in JSON-LD
const zh = await get("/zh-Hans/timeline");
assert.match(zh, new RegExp(`<link rel="canonical" href="${CANON}/zh-Hans/timeline"`), "zh canonical");
assert.match(zh, /<html lang="zh-Hans"/, "zh html lang");
assert.match(zh, /property="og:locale" content="zh_CN"/, "zh og:locale zh_CN");
assert.match(zh, /"inLanguage":"zh-Hans"/, "zh Article inLanguage");

// per-page OG image route exists for each locale
for (const p of ["/en/timeline/opengraph-image", "/zh-Hans/timeline/opengraph-image"]) {
  const og = await fetch(`${SERVER}${p}`);
  assert.equal(og.status, 200, `${p} 200`);
  assert.match(og.headers.get("content-type") ?? "", /image\/png/, `${p} is png`);
}

console.log("verify-seo: all assertions passed");
