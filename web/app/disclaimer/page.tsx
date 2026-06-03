import { Markdown } from "@/components/Markdown";
import { getProse } from "@/lib/content";

export const metadata = { title: "Disclaimer — BAM × Reckless Ben" };

export default function DisclaimerPage() {
  const md = getProse("disclaimer.md");
  return <Markdown>{md}</Markdown>;
}
