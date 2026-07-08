// Real Claude translator. The FALLBACK backend — the local model
// (translate-local.mjs) is preferred by default; this runs when
// TRANSLATE_BACKEND=anthropic or when no local model is reachable. Lazy-imported
// by translate.mjs so tests/--check never require the SDK or a key. Build-time
// only; never in the request path.
import Anthropic from "@anthropic-ai/sdk";
import { buildSystem } from "./translate-prompts.mjs";

const MODEL = "claude-sonnet-4-6";

export function makeTranslator(localeCode, mode = "document") {
  // Raise maxRetries above the SDK default (2): during a catch-up seed we make
  // dozens of sequential calls, and a transient `overloaded_error` (HTTP 529) on
  // any one of them aborts the whole run mid-locale. The SDK retries 429/5xx/529
  // with exponential backoff, so a higher cap rides out the overload windows.
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 8 });
  // Prompt + shared protected-terms glossary (proper nouns, status tokens) —
  // identical across backends; see translate-prompts.mjs.
  const system = buildSystem(localeCode, mode);
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
