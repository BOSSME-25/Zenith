import { safeSql } from "@/lib/db";
import { SubmissionTable, type Column } from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Families" };

type Row = {
  id: number;
  submitted_at: string;
  parent_name: string;
  email: string;
  phone: string | null;
  student_name: string;
  current_grade: string;
  expected_grade: string;
  zip_code: string;
  preferred_contact: string;
  how_heard: string | null;
};

const columns: Column<Row>[] = [
  { header: "Parent", accessor: (r) => r.parent_name },
  { header: "Email", accessor: (r) => r.email },
  { header: "Phone", accessor: (r) => r.phone || "—" },
  { header: "Student", accessor: (r) => r.student_name },
  { header: "Current", accessor: (r) => `${r.current_grade}th` },
  { header: "Expected", accessor: (r) => `${r.expected_grade}th` },
  { header: "Zip", accessor: (r) => r.zip_code },
  { header: "Prefers", accessor: (r) => r.preferred_contact },
];

export default async function AdminFamiliesPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM families ORDER BY submitted_at DESC LIMIT 1000`;
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Families</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">Family Interest List</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            Every family who has joined the Zenith Interest List.
          </p>
        </div>
      </header>
      <SubmissionTable
        table="families"
        rows={rows}
        columns={columns}
        searchKeys={[(r) => r.parent_name, (r) => r.email, (r) => r.student_name]}
      />
    </div>
  );
}
