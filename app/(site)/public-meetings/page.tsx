import Link from "next/link";
import { FileText } from "lucide-react";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { NextMeetingCard } from "@/components/meetings/NextMeetingCard";
import { MeetingRow, StatusNote } from "@/components/meetings/MeetingRow";
import { meetingEventJsonLd } from "@/components/meetings/eventJsonLd";
import {
  type MeetingWithDocs,
  getAccommodation,
  getNondiscrimination,
  getNoticeLocation,
  getSchedulePdf,
  getSchoolYearStart,
  listPublicMeetings,
} from "@/lib/meetings";
import {
  MEETING_TYPES,
  MEETING_TYPE_LABELS,
  formatBytes,
  formatMeetingDate,
  formatMeetingTime,
  isUpcoming,
  meetingEnd,
  onlineLabel,
  schoolYearOf,
  type MeetingType,
} from "@/lib/meetings-shared";
import { cn } from "@/lib/cn";
import { inputClass, labelClass } from "@/components/forms/FormStatus";

// A notice must not wait on a cache: this page is always read fresh.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Public Meetings",
  description:
    "Zenith's board meets in public. Find the next meeting, past agendas, and approved minutes for Zenith College and Career Prep.",
  alternates: { canonical: "/public-meetings" },
};

const STATUTE_URL = "https://www.azleg.gov/ars/38/00431-02.htm";

async function loadMeetings(): Promise<MeetingWithDocs[]> {
  try {
    return await listPublicMeetings();
  } catch (err) {
    // Without the tables (a deployment that has not run /api/init) the page
    // still renders, with its notice and an empty schedule.
    console.error(
      "[zenith][public-meetings] Could not load meetings. Has /api/init been run on this deployment?",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

export default async function PublicMeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; type?: string }>;
}) {
  const { year: yearParam, type: typeParam } = await searchParams;
  const [meetings, { location }, accommodation, schoolYear, schedule, nondiscrimination] =
    await Promise.all([
      loadMeetings(),
      getNoticeLocation(),
      getAccommodation(),
      getSchoolYearStart(),
      getSchedulePdf(),
      getNondiscrimination(),
    ]);

  const now = new Date();
  const byId = new Map(meetings.map((m) => [m.id, m]));

  // Anything not over yet, in date order, is "upcoming" (cancelled and moved
  // ones included, so the notice of a change is as visible as the meeting).
  const ahead = meetings
    .filter((m) => m.status !== "held" && meetingEnd(m).getTime() > now.getTime())
    .sort((a, b) => a.starts_at.getTime() - b.starts_at.getTime());
  const aheadIds = new Set(ahead.map((m) => m.id));
  const next = ahead.find((m) => isUpcoming(m, now) && m.meeting_type !== "committee") ?? null;
  const past = meetings.filter((m) => !aheadIds.has(m.id));

  const yearOf = (m: MeetingWithDocs) =>
    schoolYearOf(m.starts_at, schoolYear.month, schoolYear.day).key;
  const currentYear = schoolYearOf(now, schoolYear.month, schoolYear.day).key;
  const years = Array.from(new Set(past.map(yearOf))).sort().reverse();
  const typesPresent = MEETING_TYPES.filter((t) => past.some((m) => m.meeting_type === t));

  const activeYear = yearParam && years.includes(yearParam) ? yearParam : null;
  const activeType =
    typeParam && (typesPresent as string[]).includes(typeParam) ? (typeParam as MeetingType) : null;
  const shown = past.filter(
    (m) => (!activeYear || yearOf(m) === activeYear) && (!activeType || m.meeting_type === activeType),
  );
  const groups = years
    .map((y) => ({ year: y, rows: shown.filter((m) => yearOf(m) === y) }))
    .filter((g) => g.rows.length > 0);

  return (
    <>
      {next && <JsonLd data={meetingEventJsonLd(next)} />}

      <Section
        eyebrow="Governance"
        title="Public Meetings"
        titleAs="h1"
        description="Zenith's board meets in public. Find the next meeting, past agendas, and approved minutes here."
        bg="white"
      >
        <NextMeetingCard meeting={next} />
      </Section>

      <Section eyebrow="Notice" title="Notice of Public Meetings" bg="ion-soft">
        <div className="max-w-3xl rounded-2xl bg-white border border-ion p-6 md:p-8">
          <p className="text-base leading-relaxed text-midnight">
            Per{" "}
            <a
              href={STATUTE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-eventide underline underline-offset-2 hover:text-midnight"
            >
              A.R.S. § 38-431.02
            </a>
            . Notices and agendas for meetings of the Board of Directors of Zenith Community
            Schools, Inc., and any of its committees and subcommittees, are posted at least 24 hours
            before each meeting{" "}
            {location ? (
              <>
                in two places: on this page, and at {location}
              </>
            ) : (
              <>on this page</>
            )}
            . Additional notice is given as reasonable and practicable.
          </p>
        </div>
      </Section>

      <Section eyebrow="Attend" title="Attend a meeting" bg="white">
        <div className="max-w-3xl space-y-3 text-base leading-relaxed text-midnight">
          <p>
            Meetings are open to the public. The place, the online link, and the dial-in number for
            each meeting are in its notice above and on its own page.
          </p>
          {next && (next.location_name || next.location_address) && (
            <p>
              <span className="font-semibold">Next meeting, in person:</span>{" "}
              {[next.location_name, next.location_address].filter(Boolean).join(", ")}.
            </p>
          )}
          {next && !next.location_name && !next.location_address && next.virtual_url && (
            <p>
              <span className="font-semibold">Next meeting:</span>{" "}
              {onlineLabel(next.virtual_url)}. There is no in-person location. Use the Join online
              button above.
            </p>
          )}
          {accommodation.contact && accommodation.reach && accommodation.days && (
            <p>
              To request a reasonable accommodation, contact {accommodation.contact} at{" "}
              {accommodation.reach} at least {accommodation.days} business{" "}
              {accommodation.days === 1 ? "day" : "days"} before the meeting.
            </p>
          )}
        </div>
      </Section>

      <Section eyebrow="Schedule" title="Meeting schedule for the school year" bg="ion-soft">
        {schedule && (
          <p className="mb-6">
            <a
              href={schedule.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${schedule.schoolYear} meeting schedule, PDF${schedule.size ? `, ${formatBytes(schedule.size)}` : ""} (opens in a new tab)`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-eventide px-5 py-2 text-sm font-semibold text-midnight hover:bg-white transition-colors"
            >
              <FileText size={16} aria-hidden />
              {schedule.schoolYear} meeting schedule, PDF{schedule.size ? `, ${formatBytes(schedule.size)}` : ""}
            </a>
          </p>
        )}
        {ahead.length === 0 ? (
          <p className="text-midnight-75">No upcoming meetings are posted yet.</p>
        ) : (
          <ul className="max-w-3xl divide-y divide-ion rounded-2xl border border-ion bg-white">
            {ahead.map((m) => (
              <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4">
                <div>
                  <Link
                    href={`/public-meetings/${m.slug}`}
                    className="font-semibold text-midnight underline-offset-2 hover:underline hover:text-eventide"
                  >
                    {formatMeetingDate(m.starts_at)}
                  </Link>
                  <p className="text-sm text-midnight-75">
                    {m.title}, {formatMeetingTime(m.starts_at, m.ends_at)}
                  </p>
                  <StatusNote meeting={m} movedTo={m.rescheduled_to ? byId.get(m.rescheduled_to) : null} />
                </div>
                <p className="text-sm uppercase tracking-[0.12em] text-eventide font-medium">
                  {MEETING_TYPE_LABELS[m.meeting_type]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        eyebrow="Archive"
        title="Agendas and minutes"
        description="Every meeting has its own record: its agenda, its minutes once the board approves them, and any recording or materials."
        bg="white"
      >
        {past.length === 0 ? (
          <div className="max-w-3xl rounded-2xl border border-ion bg-ion-soft p-6 text-midnight">
            Agendas and approved minutes will be listed here after the first meeting is posted.
          </div>
        ) : (
          <>
            <form
              method="get"
              action="/public-meetings#archive"
              className="mb-8 flex flex-wrap items-end gap-4"
              aria-label="Filter the archive"
            >
              <div>
                <label className={labelClass} htmlFor="year">School year</label>
                <select id="year" name="year" defaultValue={activeYear ?? ""} className={cn(inputClass, "min-h-11")}>
                  <option value="">All years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="type">Meeting type</label>
                <select id="type" name="type" defaultValue={activeType ?? ""} className={cn(inputClass, "min-h-11")}>
                  <option value="">All types</option>
                  {typesPresent.map((t) => (
                    <option key={t} value={t}>{MEETING_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full bg-midnight px-6 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75"
              >
                Apply
              </button>
              {(activeYear || activeType) && (
                <Link href="/public-meetings#archive" className="inline-flex min-h-11 items-center text-sm font-semibold text-eventide underline">
                  Clear filters
                </Link>
              )}
            </form>

            <div id="archive" className="space-y-4">
              {groups.length === 0 && (
                <p className="text-midnight-75">No meetings match those filters.</p>
              )}
              {groups.map((g) => (
                <details
                  key={g.year}
                  open={activeYear ? true : g.year === currentYear}
                  className="group rounded-2xl border border-ion bg-white"
                >
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <h3 className="text-xl font-semibold text-midnight">{g.year} school year</h3>
                    <span className="text-sm text-midnight-75">
                      {g.rows.length} {g.rows.length === 1 ? "meeting" : "meetings"}
                    </span>
                  </summary>
                  <ul className="divide-y divide-ion px-5 pb-4">
                    {g.rows.map((m) => (
                      <MeetingRow
                        key={m.id}
                        meeting={m}
                        movedTo={m.rescheduled_to ? byId.get(m.rescheduled_to) : null}
                      />
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </>
        )}
      </Section>

      {nondiscrimination.text && (
        <section className="bg-ion-soft border-t border-ion py-8">
          <div className="container-prose">
            <p className="max-w-3xl text-sm leading-relaxed text-midnight-75">{nondiscrimination.text}</p>
          </div>
        </section>
      )}
    </>
  );
}
