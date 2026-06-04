import { renderOgImage } from "@/lib/og-image";

export { size, contentType } from "@/lib/og-image";
export const alt = "Where Is My Lego — Sourced Research Archive";

export default function Image() {
  return renderOgImage("Sourced Research Archive");
}
