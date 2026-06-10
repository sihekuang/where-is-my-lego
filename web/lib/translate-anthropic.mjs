// Real Claude translator. Lazy-imported by translate.mjs so tests/--check never
// require the SDK or a key. Build-time only; never in the request path.
import Anthropic from "@anthropic-ai/sdk";
import { glossaryPromptBlock } from "./glossary.mjs";

const MODEL = "claude-sonnet-4-6";

// Two prompt modes:
//  - "document": a whole Markdown doc (prose pages). Full context.
//  - "fragment": ONE standalone table cell / header / graph label / short value.
//    A document-oriented prompt makes the model refuse short fragments ("please
//    provide the full Markdown"), so fragments need their own rules.
const PROMPTS = {
  document: `You are a professional legal/archival translator.
Translate the user's Markdown into {LANG}. Hard rules:
- Preserve Markdown structure, tables, links, and URLs exactly.
- Do NOT translate: URLs, code spans, case numbers, proper names of people/companies, or the literal tokens CONFIRMED and ALLEGATION.
- Do NOT soften, strengthen, summarize, or adjudicate any statement. Translate meaning faithfully, preserving the CONFIRMED vs ALLEGATION distinction.
- Add no facts and no commentary. Output ONLY the translated Markdown.`,

  fragment: `You are a professional legal/archival translator. Each user message is ONE standalone value from an archive's data table or relationship graph: a column header, a table cell, a node label, a role, a short statement, a date, a source citation, a name, or a URL. It is often a single word or short phrase and may look incomplete — that is expected; it is a complete standalone value, NOT a fragment of a larger document.
Translate it into {LANG}. Hard rules:
- Output ONLY the translation itself: no preamble, no quotation marks, no explanation, and no added Markdown (do not add headings, bullets, or code fences). Never ask for more content and never state that the input is incomplete.
- Preserve any inline Markdown the input ALREADY contains (**bold**, [text](url), \`code\`), all URLs, case numbers, the numerals/format of dates, and proper names of people and companies.
- Do NOT translate the literal tokens CONFIRMED and ALLEGATION.
- Do NOT soften, strengthen, or adjudicate. Add no facts. If the value is a pure URL, number, or proper name with nothing translatable, return it unchanged.`,

  ui: `You are a professional UI string translator for a legal/archival website. Each user message is ONE short interface string: a navigation label, button, banner, table heading, status word, or a single sentence. Translate it into {LANG}.
CRITICAL — copy these through VERBATIM, unchanged and unmoved, translating only the surrounding words:
- Interpolation tokens wrapped in curly braces, e.g. {download}, {disclaimer}, {shown}, {total}. Never translate, rename, reorder the braces' contents, add, or remove them. (For "{shown} of {total} events", translate only "of"/"events"; keep {shown} and {total} exactly, placing them where natural in {LANG}.)
- Emphasis markers: keep every \`**\` pair. Translate the words BETWEEN the markers, but the string must contain exactly as many \`**\` as the source.
- The literal uppercase tokens CONFIRMED and ALLEGATION (keep them in uppercase Latin even if you gloss them).
- Symbols and punctuation that carry meaning: arrows ↑ ↓ →, bullet ·, ellipsis …, and URLs, case numbers, and proper names of people/companies.
Output ONLY the translation: no preamble, no quotation marks, no explanation, no added Markdown. Do NOT soften, strengthen, or adjudicate; add no facts.`,
};

const LANG = {
  "zh-Hans": "Simplified Chinese (简体中文, Mainland terminology)",
  "zh-Hant": "Traditional Chinese (繁體中文, Taiwan terminology — 臺灣正體, as written in Taiwan; use Taiwan vocabulary and standard Traditional characters, NOT Hong Kong or Simplified forms)",
  "es": "US Spanish (español de los Estados Unidos) — neutral Latin American Spanish as written for U.S. Hispanic audiences (Univision / AP Spanish style): use 'ustedes' (never 'vosotros'), Latin American vocabulary (e.g. 'computadora', not 'ordenador'); avoid Spain-specific terms",
};

export function makeTranslator(localeCode, mode = "document") {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const rules = PROMPTS[mode] ?? PROMPTS.document;
  // Append the shared protected-terms glossary so proper nouns (American Fork, AFPD,
  // BAM, party names) and the case-sensitive status tokens survive every mode.
  const system = `${rules.replace("{LANG}", LANG[localeCode] ?? localeCode)}\n\n${glossaryPromptBlock(localeCode)}`;
  return async (text) => {
    // Stream the generation: whole-doc prose units (community-sources.md, home.md)
    // now take longer than any single-read HTTP timeout can reliably cover — a
    // non-streaming create() hits APIConnectionTimeoutError at the timeout even
    // though the model is still generating. Streaming keeps the connection alive
    // per-chunk; finalMessage() returns the same shape create() would.
    const res = await client.messages
      .stream({
        model: MODEL,
        max_tokens: 16384,
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: text }],
      }, { timeout: 600_000 })
      .finalMessage();
    // Guard against silently writing a bad translation (an empty/blocked reply or
    // a max_tokens truncation would otherwise be saved AND recorded as current in
    // the manifest, so the corruption would never be re-detected).
    if (res.stop_reason === "max_tokens") {
      throw new Error(`Translation truncated at max_tokens (model=${MODEL}); raise max_tokens and re-run.`);
    }
    const out = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    if (!out) throw new Error(`Empty translation returned (model=${MODEL}, stop_reason=${res.stop_reason}).`);
    return out;
  };
}
