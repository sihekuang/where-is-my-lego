import { cn } from "@/lib/utils";

/** Decorative studs on a brick's top edge. Color comes from the parent's text color
 *  (set a `text-…` class on the wrapper). Purely visual. */
export function StudRow({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <span className={cn("brick-studs", className)} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="brick-stud" />
      ))}
    </span>
  );
}
