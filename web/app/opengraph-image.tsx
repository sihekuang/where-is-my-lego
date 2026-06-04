import { renderOgImage } from "@/lib/og-image";
import { getRelationships } from "@/lib/content";
import { graphMotifDataUri } from "@/lib/graph-motif.mjs";

export { size, contentType } from "@/lib/og-image";
export const alt = "Where Is My Lego — the BAM × Reckless Ben relationship graph";

export default function Image() {
  const graph = getRelationships();
  const motif = graphMotifDataUri(graph, { width: 1200, height: 630, theme: "dark", pad: 90 });
  return renderOgImage("Sourced Research Archive", {
    graphMotif: motif,
    tagline: "Every claim labeled Confirmed or Allegation",
  });
}
