import React from "react";

/**
 * Renders a dictionary string with lightweight inline markup:
 *  - `**bold**`  → <b>bold</b>
 *  - `{token}`   → the React node supplied in `tokens[token]` (e.g. a <Link>)
 *
 * Lets translators keep a sentence as ONE string (preserving word order across
 * languages) while still embedding emphasis and links. Unknown `{tokens}` render
 * literally, so a typo degrades visibly rather than silently dropping text.
 */
export function Rich({
  text,
  tokens = {},
}: {
  text: string;
  tokens?: Record<string, React.ReactNode>;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*|\{[a-zA-Z]+\})/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) return <b key={i}>{part.slice(2, -2)}</b>;
        const token = part.match(/^\{([a-zA-Z]+)\}$/);
        if (token && token[1] in tokens) return <React.Fragment key={i}>{tokens[token[1]]}</React.Fragment>;
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
