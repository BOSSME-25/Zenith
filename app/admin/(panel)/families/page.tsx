import { safeSql } from "@/lib/db";
import {
  SubmissionTable,
  formatSubmittedAt,
  type ColumnHeader,
  type SubmissionRow,
} from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Families" };

type Row = {
  id: number;
  submitted_at: string | Date;
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

const headers: ColumnHeader[] = [
  { label: "Parent" },
  { label: "Email" },
  { label: "Phone" },
  { label: "Student" },
  { label: "Current" },
  { label: "Expected" },
  { label: "Zip" },
  { label: "Prefers" },
];

export default async function AdminFamiliesPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM families ORDER BY submitted_at DESC LIMIT 1000`;
  const data: SubmissionRow[] = rows.map((r) => {
    const cells = [
      r.parent_name,
      r.email,
      r.phone || "—",
      r.student_name,
      `${r.current_grade}th`,
      `${r.expected_grade}th`,
      r.zip_code,
      r.preferred_contact,
    ];
    return {
      id: r.id,
      submittedAt: formatSubmittedAt(r.submitted_at),
      cells,
      searchBlob: [r.parent_name, r.email, r.student_name].join(" ").toLowerCase(),
    };
  });
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
      <SubmissionTable table="families" headers={headers} rows={data} />
    </div>
  );
}
