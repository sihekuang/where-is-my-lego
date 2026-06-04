// Real Claude translator. Lazy-imported by translate.mjs so tests/--check never
// require the SDK or a key. Build-time only; never in the request path.
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

const RULES = `You are a professional legal/archival translator.
Translate the user's Markdown into {LANG}. Hard rules:
- Preserve Markdown structure, tables, links, and URLs exactly.
- Do NOT translate: URLs, code spans, case numbers, proper names of people/companies, or the literal tokens CONFIRMED and ALLEGATION.
- Do NOT soften, strengthen, summarize, or adjudicate any statement. Translate meaning faithfully, preserving the CONFIRMED vs ALLEGATION distinction.
- Add no facts and no commentary. Output ONLY the translated Markdown.`;

const LANG = { "zh-Hans": "Simplified Chinese (简体中文, Mainland terminology)" };

export function makeTranslator(localeCode) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const system = RULES.replace("{LANG}", LANG[localeCode] ?? localeCode);
  return async (text) => {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 16384,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: text }],
    });
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
