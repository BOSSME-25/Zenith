import { safeSql } from "@/lib/db";
import { SubmissionTable, type Column } from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact Messages" };

type Row = {
  id: number;
  submitted_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
};

const columns: Column<Row>[] = [
  { header: "Name", accessor: (r) => r.name },
  { header: "Email", accessor: (r) => r.email },
  { header: "Subject", accessor: (r) => r.subject },
  {
    header: "Message",
    accessor: (r) => (r.message.length > 160 ? r.message.slice(0, 160) + "…" : r.message),
    className: "max-w-[24rem]",
  },
];

export default async function AdminContactsPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM contacts ORDER BY submitted_at DESC LIMIT 1000`;
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
      <SubmissionTable
        table="contacts"
        rows={rows}
        columns={columns}
        searchKeys={[(r) => r.name, (r) => r.email, (r) => r.subject, (r) => r.message]}
      />
    </div>
  );
}
