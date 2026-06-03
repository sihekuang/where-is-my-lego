import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { ComponentProps } from "react";
import { rewriteHref, isExternal } from "@/lib/links";

function Anchor({ href, children }: ComponentProps<"a">) {
  const target = rewriteHref(href);
  if (isExternal(target)) {
    return (
      <a href={target} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <Link href={target}>{children}</Link>;
}

/** Full block-level Markdown (prose pages). Internal .md links are rewritten. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: Anchor }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/** Inline Markdown for table cells — no surrounding <p>, links rewritten. */
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{ a: Anchor, p: ({ children }) => <>{children}</> }}
    >
      {children}
    </ReactMarkdown>
  );
}
