import { renderOgImage } from "@/lib/og-image";

export { size, contentType } from "@/lib/og-image";
export const alt = "Timeline · Where Is My Lego";

export default function Image() {
  return renderOgImage("Timeline");
}
