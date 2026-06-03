import { renderOgImage } from "@/lib/og-image";

export { size, contentType } from "@/lib/og-image";
export const alt = "Court Documents · Where Is My Lego";

export default function Image() {
  return renderOgImage("Court Documents");
}
