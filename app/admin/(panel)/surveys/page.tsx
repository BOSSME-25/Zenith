import { safeSql } from "@/lib/db";
import {
  SubmissionTable,
  formatSubmittedAt,
  type ColumnHeader,
  type SubmissionRow,
} from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Community Surveys" };

type Row = {
  id: number;
  submitted_at: string | Date;
  is_resident: boolean | null;
  has_child: boolean | null;
  career_pathways: string[] | null;
  important_to_family: string | null;
  name: string | null;
  email: string | null;
};

const headers: ColumnHeader[] = [
  { label: "Name" },
  { label: "Email" },
  { label: "Resident" },
  { label: "Has child" },
  { label: "Pathways" },
  { label: "Important", className: "max-w-[20rem]" },
];

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function yesNo(v: boolean | null): string {
  if (v == null) return "—";
  return v ? "Yes" : "No";
}

export default async function AdminSurveysPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM surveys ORDER BY submitted_at DESC LIMIT 1000`;
  const data: SubmissionRow[] = rows.map((r) => ({
    id: r.id,
    submittedAt: formatSubmittedAt(r.submitted_at),
    cells: [
      r.name || "Anonymous",
      r.email || "—",
      yesNo(r.is_resident),
      yesNo(r.has_child),
      (r.career_pathways || []).join(", ") || "—",
      truncate(r.important_to_family || "", 100) || "—",
    ],
    searchBlob: [r.name || "", r.email || "", r.important_to_family || ""].join(" ").toLowerCase(),
  }));
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Surveys</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">Community Survey Responses</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            What Maryvale tells us about the high school they want.
          </p>
        </div>
      </header>
      <SubmissionTable table="surveys" headers={headers} rows={data} />
    </div>
  );
}
