// Chooses the translator backend for a seed run. LOCAL-FIRST by design: a
// catch-up seed should run offline & free on the local model, and only reach for
// the paid Anthropic API when no local model is available.
//
// Selection (env TRANSLATE_BACKEND):
//   "local"    — force the local model; error if it's unreachable.
//   "anthropic"— force Claude (the fallback).
//   "auto" / unset (DEFAULT) — prefer local when it's reachable AND has the
//                configured model; otherwise fall back to Anthropic.
import { LOCAL_BASE_URL, LOCAL_MODEL } from "./translate-local.mjs";

// Is the local endpoint up and serving the configured model? Cheap GET /models,
// short timeout — any failure (down, wrong port, model not pulled) => not ready.
async function localReady() {
  try {
    const res = await fetch(`${LOCAL_BASE_URL}/models`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { ok: false, reason: `GET /models -> HTTP ${res.status}` };
    const data = await res.json();
    const ids = (data.data ?? []).map((m) => m.id);
    // Match the exact tag ("qwen2.5:14b") or the base name ("qwen2.5") so a
    // differently-tagged local build of the same model still counts.
    const base = LOCAL_MODEL.split(":")[0];
    const has = ids.some((id) => id === LOCAL_MODEL || id.split(":")[0] === base);
    if (!has) return { ok: false, reason: `model "${LOCAL_MODEL}" not among ${ids.length} local model(s): ${ids.slice(0, 8).join(", ")}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.name === "TimeoutError" ? "no response (timeout)" : e.message };
  }
}

// Returns { makeTranslator, name, detail }. `name` ∈ {"local","anthropic"}.
export async function resolveTranslatorFactory() {
  const forced = (process.env.TRANSLATE_BACKEND || "auto").toLowerCase();
  if (forced !== "auto" && forced !== "local" && forced !== "anthropic") {
    throw new Error(`Unknown TRANSLATE_BACKEND="${forced}" (use local | anthropic | auto).`);
  }

  if (forced !== "anthropic") {
    const ready = await localReady();
    if (ready.ok) {
      const { makeTranslator } = await import("./translate-local.mjs");
      return { makeTranslator, name: "local", detail: `${LOCAL_MODEL} @ ${LOCAL_BASE_URL}` };
    }
    if (forced === "local") {
      throw new Error(`TRANSLATE_BACKEND=local but the local model is not ready: ${ready.reason}. Start Ollama and \`ollama pull ${LOCAL_MODEL}\`, or unset TRANSLATE_BACKEND to fall back to Anthropic.`);
    }
    // auto: fall through to Anthropic, noting why local was skipped.
    const { makeTranslator } = await import("./translate-anthropic.mjs");
    return { makeTranslator, name: "anthropic", detail: `claude-sonnet-4-6 (local unavailable: ${ready.reason})` };
  }

  const { makeTranslator } = await import("./translate-anthropic.mjs");
  return { makeTranslator, name: "anthropic", detail: "claude-sonnet-4-6 (forced)" };
}
