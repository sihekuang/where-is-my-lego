import { renderOgImage } from "@/lib/og-image";

export { size, contentType } from "@/lib/og-image";
export const alt = "Lawsuit · Where Is My Lego";

export default function Image() {
  return renderOgImage("Lawsuit");
}
