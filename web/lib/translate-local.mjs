// Local translator backend — the DEFAULT (preferred over Anthropic; see
// translate-backend.mjs). Talks to any OpenAI-compatible chat endpoint, so it
// works with Ollama (`http://localhost:11434/v1`, default) or LM Studio
// (`http://localhost:1234/v1`). Free + offline; no API key. Build-time only.
//
// Config (env):
//   TRANSLATE_LOCAL_BASE_URL   default http://localhost:11434/v1   (Ollama)
//   TRANSLATE_LOCAL_MODEL      default qwen2.5:14b                 (strong zh/es, non-thinking → clean output)
//   TRANSLATE_LOCAL_MAX_TOKENS default 8192
//   TRANSLATE_LOCAL_TIMEOUT_MS default 600000
import { buildSystem } from "./translate-prompts.mjs";

export const LOCAL_BASE_URL = process.env.TRANSLATE_LOCAL_BASE_URL || "http://localhost:11434/v1";
export const LOCAL_MODEL = process.env.TRANSLATE_LOCAL_MODEL || "qwen2.5:14b";
const MAX_TOKENS = Math.max(256, parseInt(process.env.TRANSLATE_LOCAL_MAX_TOKENS ?? "8192", 10) || 8192);
const TIMEOUT_MS = Math.max(10_000, parseInt(process.env.TRANSLATE_LOCAL_TIMEOUT_MS ?? "600000", 10) || 600_000);

// Qwen3-family (and other reasoning) models can wrap chain-of-thought in
// <think>…</think>. Strip it defensively so reasoning never lands in a committed
// translation — including an unterminated block (truncated/streamed weirdness).
function stripThink(s) {
  return s
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/i, "")
    .trim();
}

export function makeTranslator(localeCode, mode = "document") {
  // Prompt + shared protected-terms glossary — identical to the Anthropic
  // backend; see translate-prompts.mjs.
  const system = buildSystem(localeCode, mode);
  return async (text) => {
    let res;
    try {
      res = await fetch(`${LOCAL_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        body: JSON.stringify({
          model: LOCAL_MODEL,
          temperature: 0, // faithful, deterministic translation — not creative
          stream: false,
          max_tokens: MAX_TOKENS,
          keep_alive: "30m", // keep the (large) model resident across the many sequential calls
          messages: [
            { role: "system", content: system },
            { role: "user", content: text },
          ],
        }),
      });
    } catch (e) {
      throw new Error(`Local translator request failed (model=${LOCAL_MODEL}, url=${LOCAL_BASE_URL}): ${e.message}. Is Ollama/LM Studio running?`);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Local translator HTTP ${res.status} (model=${LOCAL_MODEL}, url=${LOCAL_BASE_URL}): ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    const choice = data.choices?.[0];
    // finish_reason "length" == truncated at max_tokens. Same guard as the
    // Anthropic backend: never silently commit (and record as current) a
    // truncated translation — the corruption would then be undetectable.
    if (choice?.finish_reason === "length") {
      throw new Error(`Local translation truncated at max_tokens=${MAX_TOKENS} (model=${LOCAL_MODEL}); raise TRANSLATE_LOCAL_MAX_TOKENS and re-run.`);
    }
    const out = stripThink(choice?.message?.content ?? "");
    if (!out) throw new Error(`Empty local translation (model=${LOCAL_MODEL}, finish_reason=${choice?.finish_reason}).`);
    return out;
  };
}
