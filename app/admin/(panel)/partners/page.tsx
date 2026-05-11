import { safeSql } from "@/lib/db";
import { SubmissionTable, type Column } from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partners" };

type Row = {
  id: number;
  submitted_at: string;
  organization: string;
  contact_name: string;
  email: string;
  phone: string | null;
  interests: string[] | null;
  description: string;
};

const columns: Column<Row>[] = [
  { header: "Organization", accessor: (r) => r.organization },
  { header: "Contact", accessor: (r) => r.contact_name },
  { header: "Email", accessor: (r) => r.email },
  { header: "Phone", accessor: (r) => r.phone || "—" },
  { header: "Interests", accessor: (r) => (r.interests || []).join(", ") || "—" },
  {
    header: "Description",
    accessor: (r) => (r.description.length > 120 ? r.description.slice(0, 120) + "…" : r.description),
    className: "max-w-[20rem]",
  },
];

export default async function AdminPartnersPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM partners ORDER BY submitted_at DESC LIMIT 1000`;
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Partners</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">Partner Inquiries</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            Organizations and individuals interested in partnering with Zenith.
          </p>
        </div>
      </header>
      <SubmissionTable
        table="partners"
        rows={rows}
        columns={columns}
        searchKeys={[(r) => r.organization, (r) => r.contact_name, (r) => r.email]}
      />
    </div>
  );
}
