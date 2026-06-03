import { renderOgImage } from "@/lib/og-image";

export { size, contentType } from "@/lib/og-image";
export const alt = "Media Catalog · Where Is My Lego";

export default function Image() {
  return renderOgImage("Media Catalog");
}
