import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { safeSql, isDbConfigured } from "@/lib/db";
import { DeleteIssueButton } from "@/components/admin/DeleteIssueButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter Issues" };

type Row = {
  id: number;
  issue_number: number;
  month_label: string;
  hero_title: string;
  published: boolean;
  updated_at: string;
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return value;
  }
}

export default async function AdminNewsletterIssuesPage() {
  const { rows } = await safeSql<Row>`
    SELECT id, issue_number, month_label, hero_title, published, updated_at
    FROM newsletter_issues ORDER BY issue_number DESC LIMIT 200
  `;
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Newsletter</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">The Comet Trail</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            Create and edit newsletter issues. The most recent published issue appears on the public
            Newsletter page; older published issues stay available in the archive.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/subscribers"
            className="inline-flex items-center gap-2 rounded-full border border-ion bg-white px-5 py-2.5 text-sm font-semibold text-midnight hover:border-eventide"
          >
            View subscribers
          </Link>
          <Link
            href="/admin/newsletter/new"
            className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75"
          >
            <Plus size={16} aria-hidden /> New issue
          </Link>
        </div>
      </header>

      {!isDbConfigured() && (
        <div className="rounded-xl bg-white border border-ion p-5 text-sm text-midnight mb-6">
          Database is not configured — issues cannot be created or listed until <code>POSTGRES_URL</code> is set.
        </div>
      )}

      <div className="rounded-2xl bg-white border border-ion overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-midnight-75">
            No issues yet. Click <strong>New issue</strong> to create Issue 01 — the public page shows
            &ldquo;coming soon&rdquo; until the first issue is published.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ion-soft text-eventide">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Issue</th>
                <th className="px-5 py-3 text-left font-semibold">Month</th>
                <th className="px-5 py-3 text-left font-semibold">Headline</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Updated</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-ion/60">
                  <td className="px-5 py-3 font-semibold text-midnight whitespace-nowrap">
                    #{String(row.issue_number).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-3 text-midnight-75 whitespace-nowrap">{row.month_label}</td>
                  <td className="px-5 py-3 text-midnight">{row.hero_title}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        row.published
                          ? "inline-flex items-center rounded-full bg-aurora-25 text-eventide px-3 py-1 text-xs font-semibold"
                          : "inline-flex items-center rounded-full bg-ion-soft text-midnight-75 px-3 py-1 text-xs font-semibold"
                      }
                    >
                      {row.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-midnight-75 whitespace-nowrap">{formatDate(row.updated_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {row.published && (
                        <Link
                          href={`/newsletter/${row.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-md border border-ion px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-ion-soft"
                        >
                          <ExternalLink size={14} aria-hidden /> View
                        </Link>
                      )}
                      <Link
                        href={`/admin/newsletter/${row.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-ion px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-ion-soft"
                      >
                        <Pencil size={14} aria-hidden /> Edit
                      </Link>
                      <DeleteIssueButton
                        id={row.id}
                        label={`Issue ${row.issue_number} — ${row.month_label}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
