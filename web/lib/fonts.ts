import { Bricolage_Grotesque, Hanken_Grotesk, Noto_Sans_SC } from "next/font/google";

export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap",
});
export const fontSans = Hanken_Grotesk({
  subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap",
});
// Loaded only for CJK locales (see [locale]/layout.tsx). next/font self-hosts.
export const fontCJK = Noto_Sans_SC({
  weight: ["400", "500", "700"], variable: "--font-cjk", display: "swap", preload: false,
});
