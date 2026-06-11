import { safeSql } from "@/lib/db";
import {
  SubmissionTable,
  formatSubmittedAt,
  type ColumnHeader,
  type SubmissionRow,
} from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter Subscribers" };

type Row = {
  id: number;
  submitted_at: string | Date;
  email: string;
  name: string | null;
};

const headers: ColumnHeader[] = [
  { label: "Name" },
  { label: "Email" },
];

export default async function AdminNewsletterPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM newsletter_subscribers ORDER BY submitted_at DESC LIMIT 1000`;
  const data: SubmissionRow[] = rows.map((r) => ({
    id: r.id,
    submittedAt: formatSubmittedAt(r.submitted_at),
    cells: [r.name || "—", r.email],
    searchBlob: [r.name || "", r.email].join(" ").toLowerCase(),
  }));
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Newsletter</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">Newsletter Subscribers</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            Everyone who signed up to be notified when the Zenith newsletter launches. Export the list as a CSV to import into your email tool when you&apos;re ready to send.
          </p>
        </div>
      </header>
      <SubmissionTable
        table="newsletter"
        headers={headers}
        rows={data}
        emptyLabel="No subscribers yet. Signups from the Newsletter page will appear here."
      />
    </div>
  );
}
