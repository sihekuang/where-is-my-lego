import Link from "next/link";

export type Crumb = { name: string; href?: string };

/**
 * Visible breadcrumb navigation. The `trail` is the same ordered list (root → … → current)
 * passed to the page's BreadcrumbList JSON-LD, so the on-page path and the structured data
 * agree per locale. The last crumb is the current page and carries no link.
 */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  if (!trail.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link href={c.href} className="hover:text-foreground hover:underline">
                  {c.name}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-foreground" : undefined}>
                  {c.name}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-muted-foreground/60">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
