import { safeSql } from "@/lib/db";
import {
  SubmissionTable,
  formatSubmittedAt,
  type ColumnHeader,
  type SubmissionRow,
} from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Community Supporters" };

type Row = {
  id: number;
  submitted_at: string | Date;
  name: string;
  email: string;
  zip_code: string;
  roles: string[] | null;
  other_role: string | null;
  interests: string[] | null;
};

const headers: ColumnHeader[] = [
  { label: "Name" },
  { label: "Email" },
  { label: "Zip" },
  { label: "Roles" },
  { label: "Interests" },
];

export default async function AdminCommunityPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM community ORDER BY submitted_at DESC LIMIT 1000`;
  const data: SubmissionRow[] = rows.map((r) => ({
    id: r.id,
    submittedAt: formatSubmittedAt(r.submitted_at),
    cells: [
      r.name,
      r.email,
      r.zip_code,
      (r.roles || []).join(", ") || "—",
      (r.interests || []).join(", ") || "—",
    ],
    searchBlob: [r.name, r.email].join(" ").toLowerCase(),
  }));
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
      <SubmissionTable table="community" headers={headers} rows={data} />
    </div>
  );
}
