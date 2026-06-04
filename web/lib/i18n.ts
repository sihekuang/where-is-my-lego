import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_LOCALE, getLocale, isLocale } from "@/lib/locales.mjs";

export type Dict = Record<string, string>;

const UI = resolve(process.cwd(), "i18n/ui");
const cache = new Map<string, Dict>();

function load(code: string): Dict {
  if (!cache.has(code)) {
    cache.set(code, JSON.parse(readFileSync(resolve(UI, `${code}.json`), "utf8")) as Dict);
  }
  return cache.get(code)!;
}

/** Returns a translator bound to `locale`, falling back to English per key. */
export function getDict(locale: string) {
  const en = load(DEFAULT_LOCALE);
  const dict = isLocale(locale) && locale !== DEFAULT_LOCALE ? load(locale) : en;
  return (key: string) => dict[key] ?? en[key] ?? key;
}

export { DEFAULT_LOCALE, getLocale, isLocale };
