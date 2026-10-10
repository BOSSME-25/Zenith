import Link from "next/link";
import { safeSql, isDbConfigured } from "@/lib/db";
import { FeedbackActions } from "@/components/admin/FeedbackActions";
import {
  FEEDBACK_ROLE_LABELS,
  FEEDBACK_TOPIC_LABELS,
  type FeedbackRole,
  type FeedbackTopic,
} from "@/lib/validators";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feedback" };

type Row = {
  id: number;
  submitted_at: string;
  name: string;
  email: string | null;
  role: FeedbackRole;
  topic: FeedbackTopic;
  page: string | null;
  message: string;
  status: string;
};

const FILTERS = [
  { key: "new", label: "New" },
  { key: "done", label: "Done" },
  { key: "all", label: "All" },
] as const;

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "new";

  // The feedback table does not exist until /api/init has run on this
  // deployment; show a hint instead of erroring out of the admin.
  let rows: Row[] = [];
  let counts: Array<{ status: string; count: string }> = [];
  let tableMissing = false;
  try {
    const result =
      active === "all"
        ? await safeSql<Row>`SELECT * FROM feedback ORDER BY submitted_at DESC LIMIT 500`
        : await safeSql<Row>`SELECT * FROM feedback WHERE status = ${active} ORDER BY submitted_at DESC LIMIT 500`;
    rows = result.rows;
    const c = await safeSql<{ status: string; count: string }>`
      SELECT status, COUNT(*)::text AS count FROM feedback GROUP BY status
    `;
    counts = c.rows;
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
        <p className="eyebrow text-eventide">Feedback</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">Team Feedback</h1>
        <p className="mt-2 text-midnight-75 max-w-2xl">
          Suggestions, corrections, and requested information sent by board members, faculty, and staff
          from the sign-in page. Mark an item done once it&apos;s handled.
        </p>
      </header>

      {!isDbConfigured() && (
        <div className="rounded-xl bg-white border border-ion p-5 text-sm text-midnight mb-6">
          Database is not configured — feedback cannot be listed until <code>POSTGRES_URL</code> is set.
        </div>
      )}

      {tableMissing && isDbConfigured() && (
        <div className="rounded-xl bg-white border border-eventide/40 p-5 text-sm text-midnight mb-6">
          The feedback table doesn&apos;t exist yet. Visit <code>/api/init?password=YOUR_ADMIN_PASSWORD</code> once
          to create it.
        </div>
      )}

      <nav aria-label="Filter feedback" className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/feedback?status=${f.key}`}
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
          {active === "new" ? "Nothing new. You're all caught up." : "No feedback here yet."}
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="rounded-2xl bg-white border border-ion p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-midnight px-3 py-1 text-xs font-semibold text-white">
                    {FEEDBACK_TOPIC_LABELS[row.topic] ?? row.topic}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-ion-soft px-3 py-1 text-xs font-semibold text-eventide">
                    {FEEDBACK_ROLE_LABELS[row.role] ?? row.role}
                  </span>
                  {row.status === "done" && (
                    <span className="inline-flex items-center rounded-full bg-aurora-25 px-3 py-1 text-xs font-semibold text-eventide">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-midnight-75 whitespace-nowrap">{formatDate(row.submitted_at)}</p>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-ion-soft p-4 text-sm leading-relaxed text-midnight">
                {row.message}
              </p>

              <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-eventide">From</dt>
                  <dd className="text-midnight">{row.name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-eventide">Email</dt>
                  <dd className="text-midnight break-all">
                    {row.email ? (
                      <a href={`mailto:${row.email}`} className="hover:text-eventide">
                        {row.email}
                      </a>
                    ) : (
                      <span className="text-midnight-50">Not given</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-eventide">Page or section</dt>
                  <dd className="text-midnight">{row.page || <span className="text-midnight-50">Not given</span>}</dd>
                </div>
              </dl>

              <div className="mt-5 pt-4 border-t border-ion/60">
                <FeedbackActions id={row.id} status={row.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
