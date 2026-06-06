// Single source of truth for the locale set. Plain ESM (no deps) so both the
// build scripts and the Next app can import it. Add a language = append here.

export const DEFAULT_LOCALE = "en";

/**
 * @typedef {Object} Locale
 * @property {string} code      BCP-47-ish code used in the URL path segment.
 * @property {string} endonym   The language's own name, for the switcher.
 * @property {string} hreflang  `<link hreflang>` / `og:locale` alternate value (script-based for zh).
 * @property {string} ogLocale  Open Graph `og:locale` (e.g. "zh_TW").
 * @property {"ltr"|"rtl"} dir   Text direction.
 * @property {boolean} isCJK     Whether OG images must fetch a CJK font subset.
 * @property {string} [ogFont]   Google Fonts family for CJK OG rendering (CJK locales only).
 */

/** @type {Locale[]} */
export const LOCALES = [
  { code: "en",      endonym: "English",  hreflang: "en",      ogLocale: "en_US", dir: "ltr", isCJK: false },
  { code: "zh-Hans", endonym: "简体中文", hreflang: "zh-Hans", ogLocale: "zh_CN", dir: "ltr", isCJK: true,  ogFont: "Noto Sans SC" },
  { code: "zh-Hant", endonym: "繁體中文", hreflang: "zh-Hant", ogLocale: "zh_TW", dir: "ltr", isCJK: true,  ogFont: "Noto Sans TC" },
  { code: "es",      endonym: "Español",  hreflang: "es-US",   ogLocale: "es_US", dir: "ltr", isCJK: false },
];

export const TARGET_LOCALES = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE);

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export function isLocale(code) {
  return LOCALES.some((l) => l.code === code);
}

// Intentionally falls back to the default locale for an unknown `code` so render
// code always gets a usable record. Validate untrusted input (URL params) with
// isLocale() first (the route layer 404s on invalid locales before calling this).
export function getLocale(code) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES.find((l) => l.code === DEFAULT_LOCALE);
}

// Map a single BCP-47 language range (e.g. "zh-TW", "es-MX", "en-GB") to one of
// our supported locale codes, or null if nothing fits. Browsers send region
// subtags we don't model, so we collapse them onto the locale we actually ship.
function matchRange(range) {
  const lc = range.trim().toLowerCase();
  if (!lc || lc === "*") return null;
  // Exact match against a supported code (e.g. "zh-hans" -> "zh-Hans").
  const exact = LOCALE_CODES.find((c) => c.toLowerCase() === lc);
  if (exact) return exact;
  // Chinese splits by script, not language: pick Traditional vs Simplified by
  // script/region subtag, defaulting bare "zh" to Simplified (the larger base).
  if (lc === "zh" || lc.startsWith("zh-")) {
    return /(^|-)(hant|tw|hk|mo)(-|$)/.test(lc) ? "zh-Hant" : "zh-Hans";
  }
  // Otherwise fall back to the primary subtag ("es-419" -> "es", "en-US" -> "en").
  const primary = lc.split("-")[0];
  return LOCALE_CODES.find((c) => c.toLowerCase().split("-")[0] === primary) ?? null;
}

// Pick the best supported locale for an HTTP `Accept-Language` header value.
// Honors q-weights, scans ranges most-preferred-first, and falls back to the
// default locale when the visitor asks for nothing we ship. Pure + dependency-
// free so middleware (edge) and tests can both import it.
export function negotiateLocale(acceptLanguage) {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranges = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim(), q: Number.isNaN(q) ? 1 : q };
    })
    .filter((r) => r.tag && r.q > 0)
    // Stable sort keeps header order among equal weights (V8 sort is stable).
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranges) {
    const match = matchRange(tag);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}
