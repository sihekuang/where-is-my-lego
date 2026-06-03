import Link from "next/link";
import SectionedTable from "@/components/SectionedTable";
import { getMediaNews, getMediaPrimary } from "@/lib/content";

export const metadata = { title: "Media — BAM × Reckless Ben" };

export default function MediaPage() {
  const news = getMediaNews();
  const primary = getMediaPrimary();
  return (
    <div>
      <h1 className="page-title">Media catalog</h1>
      <p className="page-intro">
        Links are cataloged, <b>not re-hosted</b> (copyright). Verify channel
        ownership and bylines at the source before relying on any item. To fetch
        local copies, see the{" "}
        <Link href="/lawsuit/documents">download guidance</Link>.
      </p>

      <h2 style={{ marginTop: 28 }}>News &amp; commentary</h2>
      <SectionedTable data={news} searchPlaceholder="Search articles…" />

      <h2 id="primary" style={{ marginTop: 40 }}>
        Primary sources (videos &amp; statements)
      </h2>
      <SectionedTable data={primary} searchPlaceholder="Search primary sources…" />
    </div>
  );
}
