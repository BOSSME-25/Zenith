import { safeSql } from "@/lib/db";
import {
  SubmissionTable,
  formatSubmittedAt,
  type ColumnHeader,
  type SubmissionRow,
} from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact Messages" };

type Row = {
  id: number;
  submitted_at: string | Date;
  name: string;
  email: string;
  subject: string;
  message: string;
};

const headers: ColumnHeader[] = [
  { label: "Name" },
  { label: "Email" },
  { label: "Subject" },
  { label: "Message", className: "max-w-[24rem]" },
];

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export default async function AdminContactsPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM contacts ORDER BY submitted_at DESC LIMIT 1000`;
  const data: SubmissionRow[] = rows.map((r) => ({
    id: r.id,
    submittedAt: formatSubmittedAt(r.submitted_at),
    cells: [r.name, r.email, r.subject, truncate(r.message || "", 160)],
    searchBlob: [r.name, r.email, r.subject, r.message].join(" ").toLowerCase(),
  }));
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Contacts</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">Contact Messages</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            General messages submitted through the contact form.
          </p>
        </div>
      </header>
      <SubmissionTable table="contacts" headers={headers} rows={data} />
    </div>
  );
}
