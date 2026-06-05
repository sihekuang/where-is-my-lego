// Protected-terms glossary — the single source of truth for the proper nouns and
// status tokens the machine translator keeps mangling on re-seed. Used three ways:
//   1. translate-anthropic.mjs injects glossaryPromptBlock() into every prompt mode,
//      so the errors are prevented at the source.
//   2. translate.mjs --check warns (non-fatal) when findViolations() finds any.
//   3. glossary.test.mjs FAILS the test suite if committed translations contain a
//      forbidden rendering, so a bad re-seed is caught before it is committed.
// Zero-dependency on purpose: tests and --check must never need the SDK or a key.
//
// `forbid` lists are per-locale OUTPUT substrings that are *never* correct in this
// archive (e.g. "American Fork" is a Utah city, so 美國福克 is always wrong; AFPD is
// the American Fork Police Dept, so 空軍/阿富汗/武装部队 are always wrong). They are
// the deterministic detector; the prompt instruction is the preventive measure.

export const PROTECTED_TERMS = [
  {
    term: "American Fork",
    instruction:
      'Keep the place name "American Fork" (a city in Utah, and "AF" when it abbreviates it) in Latin script exactly — never transliterate it. Translate only a following descriptor, e.g. "American Fork police" → American Fork 警方 / policía de American Fork.',
    forbid: { "zh-Hans": ["美国福克"], "zh-Hant": ["美國福克"] },
  },
  {
    term: "AFPD",
    instruction:
      "Keep \"AFPD\" exactly as-is. It stands for the American Fork Police Department — a municipal police department. NEVER expand or guess it as Air Force, Afghan, Armed Forces, a political party, an Office of Special Investigations, or any other agency.",
    forbid: {
      "zh-Hans": ["空军", "阿富汗", "武装部队", "人民党"],
      "zh-Hant": ["空軍", "憲兵", "阿富汗", "武裝部隊", "人民黨", "特別調查辦公室", "人事指揮部"],
    },
  },
  {
    term: "BAM / Bricks & Minifigs",
    instruction: 'Keep "BAM" and "Bricks & Minifigs" as-is — it is a brand name, do not translate it.',
    forbid: { "zh-Hans": ["积木与人仔"], "zh-Hant": ["積木與人仔"] },
  },
  {
    term: "Best (Brandon Best)",
    instruction: 'In "Brandon Best" / "(Best)", Best is a person\'s surname — never render it as the retailer Best Buy.',
    forbid: { "zh-Hans": ["百思买"], "zh-Hant": ["百思買"] },
  },
  {
    term: "Entity names",
    instruction:
      "Keep these entity names in Latin script: Reckless Ben LLC, Legally Mine, Baker Bricks, Not A Pipe Publishing.",
    // prompt-only: no single substring reliably signals a mistranslation.
  },
];

// CONFIRMED / ALLEGATION are case-sensitive legal status tokens. Only the EXACT
// all-caps standalone words are preserved; every other case or form is ordinary
// prose and must be translated (this is the recurring "Confirmed → CONFIRMED" bleed).
export const STATUS_TOKEN_RULE =
  'Status tokens are case-sensitive: preserve verbatim, in uppercase Latin, ONLY the exact all-caps standalone tokens "CONFIRMED" and "ALLEGATION". Any other form is ordinary prose and MUST be translated normally — "Confirmed", "confirmed", "an allegation", "alleges", "alleged", "unproven", "as alleged" are translated, never left as a Latin uppercase token.';

/** The glossary rendered as a prompt block, appended to every translator prompt. */
export function glossaryPromptBlock(localeCode) {
  const lines = PROTECTED_TERMS.map((t) => {
    let s = `- ${t.term}: ${t.instruction}`;
    const f = t.forbid?.[localeCode];
    if (f?.length) s += ` (In ${localeCode}, never output: ${f.join(", ")}.)`;
    return s;
  });
  return [
    "PROTECTED TERMS — archive-specific proper nouns; getting them wrong injects factual errors. Follow exactly:",
    ...lines,
    `- Status tokens: ${STATUS_TOKEN_RULE}`,
  ].join("\n");
}

/** Every forbidden substring present in `text` for `localeCode`, as [{ term, found }]. */
export function findViolations(text, localeCode) {
  if (!text) return [];
  const hits = [];
  for (const t of PROTECTED_TERMS) {
    for (const bad of t.forbid?.[localeCode] ?? []) {
      if (text.includes(bad)) hits.push({ term: t.term, found: bad });
    }
  }
  return hits;
}
