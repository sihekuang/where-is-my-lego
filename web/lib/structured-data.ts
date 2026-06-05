import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, localizedPath } from "@/lib/seo";
import { DEFAULT_LOCALE, getLocale } from "@/lib/locales.mjs";

const WEBSITE_ID = `${SITE_URL}/#website`;
const ORG_ID = `${SITE_URL}/#org`;

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
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/icon.svg`,
      },
    ],
  };
}

type PageLd = { title: string; description: string; path: string; dateModified?: string; locale?: string };

/** Article describes the archive PAGE (neutral); never asserts contested claims as fact. */
export function pageJsonLd({ title, description, path, dateModified, locale = DEFAULT_LOCALE }: PageLd) {
  const loc = getLocale(locale)!; // getLocale always falls back to the default locale
  const url = `${SITE_URL}${localizedPath(locale, path)}`;
  const home = `${SITE_URL}${localizedPath(locale, "/")}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: title,
        description,
        inLanguage: loc.hreflang,
        ...(dateModified ? { dateModified } : {}),
        mainEntityOfPage: url,
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: home },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      },
    ],
  };
}
