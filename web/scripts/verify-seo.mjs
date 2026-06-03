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

// robots.txt
const robots = await get("/robots.txt");
assert.match(robots, /User-Agent:\s*\*/i, "robots names a user-agent");
assert.match(robots, /Allow:\s*\//i, "robots allows /");
assert.match(robots, new RegExp(`Sitemap:\\s*${CANON}/sitemap.xml`), "robots references sitemap");

// sitemap.xml — all 8 absolute canonical URLs
const sitemap = await get("/sitemap.xml");
for (const path of ["/", "/timeline", "/parties", "/lawsuit", "/lawsuit/documents", "/police", "/media", "/disclaimer"]) {
  assert.ok(sitemap.includes(`${CANON}${path}<`), `sitemap lists ${CANON}${path}`);
}

// manifest
const manifest = JSON.parse(await get("/manifest.webmanifest"));
assert.equal(manifest.short_name, "Where Is My Lego", "manifest short_name");

// home <head>: canonical + OG + twitter + website JSON-LD
const home = await get("/");
assert.match(home, new RegExp(`<link rel="canonical" href="${CANON}/?"`), "home canonical");
assert.match(home, /property="og:title"/, "home og:title");
assert.match(home, /property="og:image"/, "home og:image");
assert.match(home, /name="twitter:card" content="summary_large_image"/, "twitter card");
assert.match(home, /"@type":"WebSite"/, "home WebSite JSON-LD");
assert.match(home, /"@type":"Organization"/, "home Organization JSON-LD");

// a content page: unique canonical/title + Article + BreadcrumbList JSON-LD
const timeline = await get("/timeline");
assert.match(timeline, new RegExp(`<link rel="canonical" href="${CANON}/timeline"`), "timeline canonical");
assert.match(timeline, /<title>Timeline · Where Is My Lego<\/title>/, "timeline templated title");
assert.match(timeline, /"@type":"Article"/, "timeline Article JSON-LD");
assert.match(timeline, /"@type":"BreadcrumbList"/, "timeline BreadcrumbList JSON-LD");
assert.match(timeline, /name="twitter:card" content="summary_large_image"/, "content page large twitter card");

// per-page OG image route exists
const og = await fetch(`${SERVER}/timeline/opengraph-image`);
assert.equal(og.status, 200, "timeline OG image 200");
assert.match(og.headers.get("content-type") ?? "", /image\/png/, "OG image is png");

console.log("verify-seo: all assertions passed");
