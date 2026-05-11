import { safeSql } from "@/lib/db";
import { SubmissionTable, type Column } from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Community Supporters" };

type Row = {
  id: number;
  submitted_at: string;
  name: string;
  email: string;
  zip_code: string;
  roles: string[] | null;
  other_role: string | null;
  interests: string[] | null;
};

const columns: Column<Row>[] = [
  { header: "Name", accessor: (r) => r.name },
  { header: "Email", accessor: (r) => r.email },
  { header: "Zip", accessor: (r) => r.zip_code },
  { header: "Roles", accessor: (r) => (r.roles || []).join(", ") || "—" },
  { header: "Interests", accessor: (r) => (r.interests || []).join(", ") || "—" },
];

export default async function AdminCommunityPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM community ORDER BY submitted_at DESC LIMIT 1000`;
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Community</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">Community Supporters</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            Educators, neighbors, business owners, alumni, and faith leaders who are standing with Zenith.
          </p>
        </div>
      </header>
      <SubmissionTable
        table="community"
        rows={rows}
        columns={columns}
        searchKeys={[(r) => r.name, (r) => r.email]}
      />
    </div>
  );
}
