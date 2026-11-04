import Link from "next/link";
import { requireSection } from "@/lib/auth";
import { Plus } from "lucide-react";
import { isDbConfigured } from "@/lib/db";
import { listAdminMeetings, type MeetingWithDocs } from "@/lib/meetings";
import {
  MEETING_TYPE_LABELS,
  DAY_MS,
  effectiveStatus,
  endOfWorkingDay,
  formatMeetingDate,
  formatMeetingTime,
  meetingEnd,
  phoenixDateKey,
} from "@/lib/meetings-shared";
import { cn } from "@/lib/cn";
import { NoticeLocationBanner } from "@/components/admin/NoticeLocationBanner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meetings" };

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "minutes", label: "Needs minutes" },
  { key: "archive", label: "Archive" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft (not public)",
  scheduled: "Posted",
  cancelled: "Cancelled",
  rescheduled: "Moved",
  held: "Held",
};

const hasDoc = (m: MeetingWithDocs, kind: string) => m.docs.some((d) => d.kind === kind);

function Badge({ children, tone = "red" }: { children: React.ReactNode; tone?: "red" | "grey" }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "red" ? "bg-red-100 text-red-800" : "bg-ion-soft text-midnight-75",
      )}
    >
      {children}
    </span>
  );
}

export default async function AdminMeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireSection("meetings");
  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === rawTab) ? (rawTab as Tab) : "upcoming";
  const now = new Date();

  let meetings: MeetingWithDocs[] = [];
  let loadError = false;
  try {
    meetings = await listAdminMeetings();
  } catch (err) {
    loadError = true;
    console.error(
      "[zenith][meetings] Could not load meetings. Has /api/init been run on this deployment?",
      err instanceof Error ? err.message : err,
    );
  }

  const isFuture = (m: MeetingWithDocs) => meetingEnd(m).getTime() > now.getTime();
  const upcoming = meetings
    .filter((m) => m.status === "draft" || (m.status !== "held" && isFuture(m)))
    .sort((a, b) => a.starts_at.getTime() - b.starts_at.getTime());
  const needsMinutes = meetings.filter(
    (m) => effectiveStatus(m, now) === "held" && m.minutes_status !== "approved",
  );
  const upcomingIds = new Set(upcoming.map((m) => m.id));
  const archive = meetings.filter((m) => !upcomingIds.has(m.id));

  const rows = tab === "upcoming" ? upcoming : tab === "minutes" ? needsMinutes : archive;
  const counts = { upcoming: upcoming.length, minutes: needsMinutes.length, archive: archive.length };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow text-eventide">Meetings</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">Public meetings</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            Post meeting notices, attach agendas, and upload minutes. Everything here appears on the
            public Public Meetings page once a notice is published.
          </p>
        </div>
        <Link
          href="/admin/meetings/new"
          className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75 min-h-11"
        >
          <Plus size={16} aria-hidden /> New meeting
        </Link>
      </header>

      <NoticeLocationBanner />

      {(!isDbConfigured() || loadError) && (
        <div className="rounded-xl bg-white border border-ion p-5 text-sm text-midnight mb-6">
          {!isDbConfigured()
            ? "The database is not configured, so meetings cannot be listed."
            : "Meetings could not be loaded. If this is a new deployment, run /api/init once to create the meetings tables."}
        </div>
      )}

      <nav aria-label="Meeting lists" className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "upcoming" ? "/admin/meetings" : `/admin/meetings?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium border transition-colors min-h-11 inline-flex items-center gap-2",
              tab === t.key
                ? "bg-midnight text-white border-midnight"
                : "bg-white text-midnight border-ion hover:bg-ion-soft",
            )}
          >
            {t.label}
            <span className={cn("text-xs", tab === t.key ? "text-ion" : "text-midnight-75")}>
              {counts[t.key]}
            </span>
          </Link>
        ))}
      </nav>

      <div className="rounded-2xl bg-white border border-ion overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-midnight-75">
            {tab === "upcoming"
              ? "Nothing upcoming. Use New meeting to post the next one."
              : tab === "minutes"
                ? "Every past meeting has approved minutes."
                : "No archived meetings yet."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ion-soft text-eventide text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Meeting</th>
                <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Agenda</th>
                <th scope="col" className="px-4 py-3 font-semibold">Minutes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const eff = effectiveStatus(m, now);
                const startsSoon = m.starts_at.getTime() - now.getTime() < 2 * DAY_MS && m.starts_at > now;
                const agendaMissing = m.status === "scheduled" && startsSoon && !hasDoc(m, "agenda");
                const minutesOverdue =
                  eff === "held" &&
                  m.minutes_status === "none" &&
                  now > endOfWorkingDay(phoenixDateKey(m.starts_at), 3);
                return (
                  <tr key={m.id} className="border-t border-ion align-top">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/meetings/${m.id}`}
                        className="font-semibold text-midnight hover:text-eventide underline-offset-2 hover:underline"
                      >
                        {m.title}
                      </Link>
                      <p className="text-midnight-75">
                        {formatMeetingDate(m.starts_at)}, {formatMeetingTime(m.starts_at)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-midnight">{MEETING_TYPE_LABELS[m.meeting_type]}</td>
                    <td className="px-4 py-3">
                      <span className="text-midnight">{STATUS_LABEL[eff] ?? eff}</span>
                    </td>
                    <td className="px-4 py-3">
                      {hasDoc(m, "agenda") ? "Yes" : "No"}
                      {agendaMissing && (
                        <div className="mt-1">
                          <Badge>Agenda missing</Badge>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {m.minutes_status === "approved" ? (
                        "Approved"
                      ) : m.minutes_status === "draft" ? (
                        "Draft, awaiting approval"
                      ) : eff === "held" ? (
                        "Not posted"
                      ) : (
                        <span className="text-midnight-75">Not due yet</span>
                      )}
                      {minutesOverdue && (
                        <div className="mt-1">
                          <Badge>Minutes overdue</Badge>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
