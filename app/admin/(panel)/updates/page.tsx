import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { safeSql, isDbConfigured } from "@/lib/db";
import { DeleteUpdateButton } from "@/components/admin/DeleteUpdateButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Updates Manager" };

type Row = {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  publish_date: string;
  updated_at: string;
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return value;
  }
}

export default async function AdminUpdatesPage() {
  const { rows } = await safeSql<Row>`
    SELECT id, title, slug, published, publish_date, updated_at
    FROM updates ORDER BY publish_date DESC LIMIT 500
  `;
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Updates</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">Manage Updates</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            Publish and edit news posts that appear on the public Updates page.
          </p>
        </div>
        <Link
          href="/admin/updates/new"
          className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75"
        >
          <Plus size={16} aria-hidden /> New update
        </Link>
      </header>

      {!isDbConfigured() && (
        <div className="rounded-xl bg-white border border-ion p-5 text-sm text-midnight mb-6">
          Database is not configured — updates cannot be created or listed until <code>POSTGRES_URL</code> is set.
        </div>
      )}

      <div className="rounded-2xl bg-white border border-ion overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-midnight-75">No updates yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ion-soft text-eventide">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Publish date</th>
                <th className="px-5 py-3 text-left font-semibold">Title</th>
                <th className="px-5 py-3 text-left font-semibold">Slug</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-ion/60">
                  <td className="px-5 py-3 text-midnight-75 whitespace-nowrap">{formatDate(row.publish_date)}</td>
                  <td className="px-5 py-3 font-medium text-midnight">{row.title}</td>
                  <td className="px-5 py-3 text-midnight-75 font-mono text-xs">/updates/{row.slug}</td>
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
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/updates/${row.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-ion px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-ion-soft"
                      >
                        <Pencil size={14} aria-hidden /> Edit
                      </Link>
                      <DeleteUpdateButton id={row.id} title={row.title} />
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
