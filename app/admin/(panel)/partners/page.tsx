import { safeSql } from "@/lib/db";
import {
  SubmissionTable,
  formatSubmittedAt,
  type ColumnHeader,
  type SubmissionRow,
} from "@/components/admin/SubmissionTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partners" };

type Row = {
  id: number;
  submitted_at: string | Date;
  organization: string;
  contact_name: string;
  email: string;
  phone: string | null;
  interests: string[] | null;
  description: string;
};

const headers: ColumnHeader[] = [
  { label: "Organization" },
  { label: "Contact" },
  { label: "Email" },
  { label: "Phone" },
  { label: "Interests" },
  { label: "Description", className: "max-w-[20rem]" },
];

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export default async function AdminPartnersPage() {
  const { rows } = await safeSql<Row>`SELECT * FROM partners ORDER BY submitted_at DESC LIMIT 1000`;
  const data: SubmissionRow[] = rows.map((r) => ({
    id: r.id,
    submittedAt: formatSubmittedAt(r.submitted_at),
    cells: [
      r.organization,
      r.contact_name,
      r.email,
      r.phone || "—",
      (r.interests || []).join(", ") || "—",
      truncate(r.description || "", 120),
    ],
    searchBlob: [r.organization, r.contact_name, r.email].join(" ").toLowerCase(),
  }));
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
      <SubmissionTable table="partners" headers={headers} rows={data} />
    </div>
  );
}
