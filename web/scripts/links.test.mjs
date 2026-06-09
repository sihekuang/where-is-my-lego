import assert from "node:assert/strict";
import { rewriteHref, localizeHref, isExternal } from "../lib/links.ts";

// --- rewriteHref: unchanged base behavior (locale-agnostic route mapping) ---
assert.equal(rewriteHref("./timeline.md"), "/timeline", "rewriteHref maps timeline.md");
assert.equal(rewriteHref("../media/community-sources.md"), "/media/community-sources", "rewriteHref maps community-sources");
assert.equal(rewriteHref("https://example.com"), "https://example.com", "rewriteHref leaves external");

// --- localizeHref: internal links MUST carry the active locale segment ---
assert.equal(
  localizeHref("./media/community-sources.md", "zh-Hant"),
  "/zh-Hant/media/community-sources",
  "community-sources link is locale-prefixed",
);
assert.equal(localizeHref("../timeline.md", "es"), "/es/timeline", "timeline link is locale-prefixed");
assert.equal(localizeHref("./parties.md", "zh-Hans"), "/zh-Hans/parties", "parties link is locale-prefixed");

// fragment must survive the prefixing
assert.equal(
  localizeHref("media/primary-sources.md", "zh-Hans"),
  "/zh-Hans/media#primary",
  "fragment preserved after prefixing",
);

// README maps to the locale home (not a doubled slash)
assert.equal(localizeHref("./README.md", "en"), "/en", "README maps to locale home");

// external + pure-fragment links are left untouched
assert.equal(localizeHref("https://youtu.be/abc", "es"), "https://youtu.be/abc", "external unchanged");
assert.equal(localizeHref("#roster", "es"), "#roster", "pure fragment unchanged");

// unknown .md falls back to the stripped route AND is still locale-prefixed
assert.equal(localizeHref("./some/new-page.md", "es"), "/es/some/new-page", "unknown .md prefixed");

// invalid locale falls back to the default locale (defense-in-depth; route layer 404s these)
assert.equal(localizeHref("./timeline.md", "fr"), "/en/timeline", "invalid locale falls back to default");

// idempotent: an already locale-prefixed path is not double-prefixed
assert.equal(localizeHref("/zh-Hant/media", "zh-Hant"), "/zh-Hant/media", "already-prefixed not doubled");

// --- Class B: contributor docs (no site route) map to the canonical GitHub source ---
for (const f of ["AGENTS.md", "CONTRIBUTING.md", "SKILL.md"]) {
  const out = localizeHref(`./${f}`, "zh-Hans");
  assert.ok(isExternal(out), `${f} maps to an external URL`);
  assert.ok(
    out === `https://github.com/sihekuang/where-is-my-lego/blob/main/${f}`,
    `${f} points at the GitHub blob (got ${out})`,
  );
}

console.log("links: rewrite + locale-prefix + class-B assertions passed");
