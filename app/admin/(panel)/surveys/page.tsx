import { safeSql } from "@/lib/db";
import { SubmissionTable, type Column } from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Community Surveys" };

type Row = {
  id: number;
  submitted_at: string;
  is_resident: boolean | null;
  has_child: boolean | null;
  career_pathways: string[] | null;
  important_to_family: string | null;
  name: string | null;
  email: string | null;
};

const columns: Column<Row>[] = [
  { header: "Name", accessor: (r) => r.name || "Anonymous" },
  { header: "Email", accessor: (r) => r.email || "—" },
  { header: "Resident", accessor: (r) => (r.is_resident == null ? "—" : r.is_resident ? "Yes" : "No") },
  { header: "Has child", accessor: (r) => (r.has_child == null ? "—" : r.has_child ? "Yes" : "No") },
  { header: "Pathways", accessor: (r) => (r.career_pathways || []).join(", ") || "—" },
  {
    header: "Important",
    accessor: (r) => {
      const t = r.important_to_family || "";
      return t.length > 100 ? t.slice(0, 100) + "…" : t || "—";
    },
    className: "max-w-[20rem]",
  },
];

export default async function AdminSurveysPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM surveys ORDER BY submitted_at DESC LIMIT 1000`;
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
      <SubmissionTable
        table="surveys"
        rows={rows}
        columns={columns}
        searchKeys={[(r) => r.name || "", (r) => r.email || "", (r) => r.important_to_family || ""]}
      />
    </div>
  );
}
