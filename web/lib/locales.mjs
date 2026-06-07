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
