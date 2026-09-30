import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { safeSql, isDbConfigured } from "@/lib/db";
import { NominationActions } from "@/components/admin/NominationActions";
import {
  MILESTONE_LABELS,
  type MilestoneType,
  RELATIONSHIP_LABELS,
  type NominatorRelationship,
} from "@/lib/validators";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nominations" };

type Row = {
  id: number;
  submitted_at: string;
  nominee_name: string;
  nominee_grade_or_grad_year: string;
  nominator_name: string;
  nominator_relationship: NominatorRelationship;
  nominator_email: string;
  milestone_type: MilestoneType;
  description: string;
  nominee_contact_info: string | null;
  status: string;
  review_notes: string | null;
};

const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
}

export default async function AdminNominationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; approved?: string }>;
}) {
  const { status, approved } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "pending";

  // The nominations table does not exist until /api/init has run on this
  // deployment; show the empty state instead of erroring out of the admin.
  let rows: Row[] = [];
  let counts: Array<{ status: string; count: string }> = [];
  let tableMissing = false;
  try {
    const result =
      active === "all"
        ? await safeSql<Row>`SELECT * FROM nominations ORDER BY submitted_at DESC LIMIT 500`
        : await safeSql<Row>`SELECT * FROM nominations WHERE status = ${active} ORDER BY submitted_at DESC LIMIT 500`;
    rows = result.rows;
    const countResult = await safeSql<{ status: string; count: string }>`
      SELECT status, COUNT(*)::text AS count FROM nominations GROUP BY status
    `;
    counts = countResult.rows;
  } catch {
    tableMissing = true;
  }
  const countFor = (key: string) =>
    key === "all"
      ? counts.reduce((sum, c) => sum + Number(c.count), 0)
      : Number(counts.find((c) => c.status === key)?.count ?? 0);

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow text-eventide">Comets</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">Nominations</h1>
        <p className="mt-2 text-midnight-75 max-w-2xl">
          Every nomination arrives here for review. Approving one creates an unpublished draft
          profile — it still needs a photo, tags, and a signed consent record before it can go live.
        </p>
      </header>

      {approved && (
        <div className="rounded-xl bg-white border border-aurora p-5 mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} aria-hidden className="mt-0.5 flex-none text-aurora" />
            <div>
              <p className="text-sm font-semibold text-midnight">
                Draft profile created for {approved}.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-midnight-75">
                It is not public yet. Add a photo, field tags, and the signed consent record under
                Comets — publishing stays blocked until consent is on file.
              </p>
            </div>
          </div>
          <Link
            href="/admin/comets"
            className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75 whitespace-nowrap"
          >
            Finish under Comets <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      )}

      {!isDbConfigured() && (
        <div className="rounded-xl bg-white border border-ion p-5 text-sm text-midnight mb-6">
          Database is not configured — nominations cannot be listed until <code>POSTGRES_URL</code> is set.
        </div>
      )}

      {tableMissing && isDbConfigured() && (
        <div className="rounded-xl bg-white border border-eventide/40 p-5 text-sm text-midnight mb-6">
          The nominations table doesn&apos;t exist yet. Visit{" "}
          <code>/api/init?password=YOUR_ADMIN_PASSWORD</code> once to create it.
        </div>
      )}

      <nav aria-label="Filter nominations" className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/nominations?status=${f.key}`}
            aria-current={active === f.key ? "true" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium border",
              active === f.key
                ? "bg-midnight text-white border-midnight"
                : "bg-white text-midnight border-ion hover:bg-ion-soft",
            )}
          >
            {f.label} ({countFor(f.key)})
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white border border-ion px-6 py-12 text-center text-midnight-75">
          No {active === "all" ? "" : active} nominations.
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="rounded-2xl bg-white border border-ion p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold text-midnight">{row.nominee_name}</h2>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                        row.status === "pending" && "bg-ion-soft text-eventide",
                        row.status === "approved" && "bg-aurora-25 text-eventide",
                        row.status === "rejected" && "bg-midnight-soft/40 text-midnight-75",
                      )}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-midnight-75">
                    {row.nominee_grade_or_grad_year} · {MILESTONE_LABELS[row.milestone_type] ?? row.milestone_type}
                  </p>
                </div>
                <p className="text-xs text-midnight-75 whitespace-nowrap">{formatDate(row.submitted_at)}</p>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-ion-soft p-4 text-sm leading-relaxed text-midnight">
                {row.description}
              </p>

              <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-eventide">Nominated by</dt>
                  <dd className="text-midnight">
                    {row.nominator_name} ({RELATIONSHIP_LABELS[row.nominator_relationship] ?? row.nominator_relationship})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-eventide">Nominator email</dt>
                  <dd className="text-midnight break-all">
                    <a href={`mailto:${row.nominator_email}`} className="hover:text-eventide">
                      {row.nominator_email}
                    </a>
                  </dd>
                </div>
                {row.nominee_contact_info && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-[0.12em] text-eventide">
                      How to reach the nominee
                    </dt>
                    <dd className="text-midnight whitespace-pre-wrap">{row.nominee_contact_info}</dd>
                  </div>
                )}
                {row.review_notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-[0.12em] text-eventide">
                      Rejection reason (internal)
                    </dt>
                    <dd className="text-midnight-75">{row.review_notes}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-5 pt-4 border-t border-ion/60">
                <NominationActions id={row.id} status={row.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
