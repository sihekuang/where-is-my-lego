// Single source of truth for the site's content route paths — locale-LESS (no leading
// locale segment) and excluding the home page ("/").
//
// The middleware uses this to redirect locale-less URLs (/timeline) and wrong-locale URLs
// (/fr/timeline) to their default-locale equivalent (/en/timeline). scripts/routes.test.mjs
// guards this list against the actual app/[locale] page routes so it can never silently drift.
export const ROUTE_PATHS = [
  "/timeline",
  "/parties",
  "/lawsuit",
  "/lawsuit/documents",
  "/police",
  "/media",
  "/media/community-sources",
  "/disclaimer",
];
