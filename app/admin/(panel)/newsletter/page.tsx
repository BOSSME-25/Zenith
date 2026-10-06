import Link from "next/link";
import { Plus, Pencil, ExternalLink, CheckCircle2, Info } from "lucide-react";
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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default async function AdminNewsletterIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { rows } = await safeSql<Row>`
    SELECT id, issue_number, month_label, hero_title, published, updated_at
    FROM newsletter_issues ORDER BY issue_number DESC LIMIT 200
  `;

  // The public Newsletter page leads with the published issue that has the
  // highest number — not the most recently saved one. Rows arrive in that order.
  const lead = rows.find((r) => r.published) ?? null;
  const savedRow = saved && Number.isFinite(Number(saved)) ? rows.find((r) => r.id === Number(saved)) : undefined;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Newsletter</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">The Comet Trail</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            Create and edit newsletter issues. Ticking <strong>Published</strong> and saving puts an
            issue on the site — there is no separate publish button. The public Newsletter page leads
            with the published issue that has the <strong>highest issue number</strong>; the others
            stay available in the archive.
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

      {savedRow && (
        <div
          className={
            savedRow.published
              ? "rounded-xl bg-white border border-aurora p-5 mb-6 flex flex-wrap items-start justify-between gap-4"
              : "rounded-xl bg-white border border-eventide/40 p-5 mb-6 flex flex-wrap items-start justify-between gap-4"
          }
        >
          <div className="flex items-start gap-3">
            {savedRow.published ? (
              <CheckCircle2 size={20} aria-hidden className="mt-0.5 flex-none text-aurora" />
            ) : (
              <Info size={20} aria-hidden className="mt-0.5 flex-none text-eventide" />
            )}
            <div>
              {!savedRow.published && (
                <>
                  <p className="text-sm font-semibold text-midnight">
                    Issue {pad(savedRow.issue_number)} saved as a draft.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-midnight-75">
                    It is not visible on the site. To put it live, click Edit, tick{" "}
                    <strong>Published</strong>, and save again — there is no separate publish button.
                  </p>
                </>
              )}
              {savedRow.published && lead && lead.id === savedRow.id && (
                <>
                  <p className="text-sm font-semibold text-midnight">
                    Issue {pad(savedRow.issue_number)} is live.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-midnight-75">
                    It is the latest issue, so it leads the public Newsletter page.
                  </p>
                </>
              )}
              {savedRow.published && lead && lead.id !== savedRow.id && (
                <>
                  <p className="text-sm font-semibold text-midnight">
                    Issue {pad(savedRow.issue_number)} is published, but it is not the lead issue.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-midnight-75">
                    The Newsletter page always leads with the highest issue number, and Issue{" "}
                    {pad(lead.issue_number)} is higher, so this one appears under Past issues. To make
                    it the lead, edit it and give it a higher number than {pad(lead.issue_number)}.
                  </p>
                </>
              )}
            </div>
          </div>
          {savedRow.published && (
            <Link
              href={lead && lead.id === savedRow.id ? "/newsletter" : `/newsletter/${savedRow.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75 whitespace-nowrap"
            >
              View on the site <ExternalLink size={15} aria-hidden />
            </Link>
          )}
        </div>
      )}

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
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={
                          row.published
                            ? "inline-flex items-center rounded-full bg-aurora-25 text-eventide px-3 py-1 text-xs font-semibold"
                            : "inline-flex items-center rounded-full bg-ion-soft text-midnight-75 px-3 py-1 text-xs font-semibold"
                        }
                      >
                        {row.published ? "Published" : "Draft"}
                      </span>
                      {lead && lead.id === row.id && (
                        <span className="inline-flex items-center whitespace-nowrap rounded-full bg-midnight px-3 py-1 text-xs font-semibold text-white">
                          Showing as latest
                        </span>
                      )}
                    </div>
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
