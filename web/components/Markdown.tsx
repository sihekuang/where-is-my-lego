import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { ComponentProps } from "react";
import { localizeHref, isExternal } from "@/lib/links";
import { DEFAULT_LOCALE } from "@/lib/locales.mjs";
import { BrickTableFrame } from "@/components/brick/BrickTableFrame";

// Anchor needs the active locale to build locale-prefixed internal links, so it
// is created per-render with the locale bound in (react-markdown takes a plain
// component in its `components` map, not props we control).
function makeAnchor(locale: string) {
  return function Anchor({ href, children }: ComponentProps<"a">) {
    const target = localizeHref(href, locale);
    if (isExternal(target)) {
      return (
        <a href={target} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return <Link href={target}>{children}</Link>;
  };
}

/** Render Markdown tables with the same brick chrome as the SectionedTable component. */
function Table({ children }: ComponentProps<"table">) {
  return (
    <BrickTableFrame>
      <table className="brick-table">{children}</table>
    </BrickTableFrame>
  );
}

/** Full block-level Markdown (prose pages). Internal .md links are rewritten + locale-prefixed. */
export function Markdown({ children, locale = DEFAULT_LOCALE }: { children: string; locale?: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: makeAnchor(locale), table: Table }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/** Inline Markdown for table cells — no surrounding <p>, links rewritten + locale-prefixed. */
export function InlineMarkdown({ children, locale = DEFAULT_LOCALE }: { children: string; locale?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{ a: makeAnchor(locale), p: ({ children }) => <>{children}</> }}
    >
      {children}
    </ReactMarkdown>
  );
}
