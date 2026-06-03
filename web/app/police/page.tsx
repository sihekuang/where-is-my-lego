import { Markdown } from "@/components/Markdown";
import { getProse } from "@/lib/content";

export const metadata = { title: "Police controversy — BAM × Reckless Ben" };

export default function PolicePage() {
  const md = getProse("police.md");
  return <Markdown>{md}</Markdown>;
}
