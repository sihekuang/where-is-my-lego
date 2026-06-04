import type { ReactNode } from "react";
import { StudRow } from "@/components/brick/StudRow";

/** Shared brick chrome for every data table on the site: a rounded, bordered
 *  frame with a stud cap on the top-left edge. Wrap a `<table className="brick-table">`
 *  in it so prose (Markdown) tables and the SectionedTable component render identically. */
export function BrickTableFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative my-4">
      <StudRow count={2} className="text-border" />
      <div className="overflow-x-auto rounded-md border border-border">{children}</div>
    </div>
  );
}
