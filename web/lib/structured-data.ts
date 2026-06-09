import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, localizedPath } from "@/lib/seo";
import { DEFAULT_LOCALE, getLocale } from "@/lib/locales.mjs";
import { breadcrumbItemList, datasetJsonLd, faqPageJsonLd } from "@/lib/structured-data-extras.mjs";

const WEBSITE_ID = `${SITE_URL}/#website`;
const ORG_ID = `${SITE_URL}/#org`;
const SUBJECT_ID = `${SITE_URL}/#subject`;

/** The neutral subject ENTITY (a topic, never a verdict). Lives in siteJsonLd, which the layout
 *  renders on every page, so Article `about` references resolve site-wide. */
const SUBJECT_ABOUT = {
  "@type": "Thing",
  "@id": SUBJECT_ID,
  name: "Bricks & Minifigs (BAM) – Reckless Ben LEGO consignment dispute",
  description:
    "A disputed LEGO Star Wars consignment that escalated into a viral investigation, two arrests, a " +
    "police-conduct controversy, and a 13-count Utah civil lawsuit. No court has found any party liable.",
};

/** Public, neutral topic terms — individuals appear only in their public roles. */
const ARTICLE_KEYWORDS = [
  "Bricks & Minifigs",
  "BAM",
  "Reckless Ben",
  "Benjamin Schneider",
  "LEGO Star Wars collection",
  "consignment dispute",
  "Utah lawsuit",
  "American Fork Police Department",
  "Bryan Mansell",
  "where is my Lego",
];

/** Inlined Organization (full node) for self-contained graphs like Dataset. */
function orgNode() {
  return { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: `${SITE_URL}/`, logo: `${SITE_URL}/icon.svg` };
}

export function siteJsonLd(locale: string = DEFAULT_LOCALE) {
  const loc = getLocale(locale)!; // getLocale always falls back to the default locale
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: loc.hreflang,
        about: { "@id": SUBJECT_ID },
        publisher: { "@id": ORG_ID },
      },
      orgNode(),
      SUBJECT_ABOUT,
    ],
  };
}

type Crumb = { name: string; href?: string };
type PageLd = {
  title: string;
  description: string;
  path: string;
  dateModified?: string;
  locale?: string;
  /** Optional localized breadcrumb trail (root → … → current). The last crumb omits its href.
   *  When absent, a flat Home → {title} breadcrumb is emitted (back-compat). */
  breadcrumb?: Crumb[];
};

/** Article describes the archive PAGE (neutral); never asserts contested claims as fact. */
export function pageJsonLd({ title, description, path, dateModified, locale = DEFAULT_LOCALE, breadcrumb }: PageLd) {
  const loc = getLocale(locale)!; // getLocale always falls back to the default locale
  const url = `${SITE_URL}${localizedPath(locale, path)}`;
  const home = `${SITE_URL}${localizedPath(locale, "/")}`;
  const trail =
    breadcrumb && breadcrumb.length
      ? breadcrumb.map((c) => ({ name: c.name, item: c.href ? `${SITE_URL}${c.href}` : undefined }))
      : [
          { name: "Home", item: home },
          { name: title, item: url },
        ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: title,
        description,
        inLanguage: loc.hreflang,
        ...(dateModified ? { dateModified } : {}),
        isAccessibleForFree: true,
        about: { "@id": SUBJECT_ID },
        keywords: ARTICLE_KEYWORDS,
        mainEntityOfPage: url,
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORG_ID },
      },
      breadcrumbItemList(trail),
    ],
  };
}

/** schema.org Dataset for the timeline view (a structured, source-attributed event record). */
export function timelineDatasetJsonLd(locale: string = DEFAULT_LOCALE, dateModified?: string) {
  const loc = getLocale(locale)!; // getLocale always falls back to the default locale
  return datasetJsonLd({
    name: `Timeline · ${SITE_NAME}`,
    description:
      "Chronological, source-attributed record (2023–2026) of the Bricks & Minifigs (BAM) – Reckless Ben " +
      "dispute: consignment, repossession, arrests, the search warrant, and the Utah lawsuit. Each entry is " +
      "labeled Confirmed or Allegation.",
    url: `${SITE_URL}${localizedPath(locale, "/timeline")}`,
    inLanguage: loc.hreflang,
    temporalCoverage: "2023-11/2026-06",
    dateModified,
    keywords: ARTICLE_KEYWORDS,
    publisher: orgNode(),
  });
}

/** schema.org FAQPage for the homepage (neutral, sourced Q&A; see structured-data-extras.mjs). */
export function homeFaqJsonLd() {
  return faqPageJsonLd();
}
