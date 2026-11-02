import Link from "next/link";
import type { MeetingWithDocs } from "@/lib/meetings";
import {
  MEETING_TYPE_LABELS,
  formatMeetingDate,
  formatMeetingTime,
  formatShortDate,
} from "@/lib/meetings-shared";
import { MeetingDocs } from "./MeetingDocs";

/** Cancelled and moved meetings stay on the page, with a text label, never a colour alone. */
export function StatusNote({
  meeting,
  movedTo,
}: {
  meeting: MeetingWithDocs;
  movedTo?: MeetingWithDocs | null;
}) {
  if (meeting.status === "cancelled") {
    return (
      <p className="text-sm font-semibold text-midnight">
        Cancelled
        {meeting.status_reason && (
          <span className="font-normal text-midnight-75">: {meeting.status_reason}</span>
        )}
      </p>
    );
  }
  if (meeting.status === "rescheduled") {
    return (
      <p className="text-sm font-semibold text-midnight">
        {movedTo ? (
          <>
            Moved to{" "}
            <Link
              href={`/public-meetings/${movedTo.slug}`}
              className="text-eventide underline underline-offset-2 hover:text-midnight"
            >
              {formatShortDate(movedTo.starts_at)}
            </Link>
          </>
        ) : (
          "Moved to a new date"
        )}
      </p>
    );
  }
  return null;
}

/** One meeting in the archive: its date and type, then every document for it. */
export function MeetingRow({
  meeting,
  movedTo,
}: {
  meeting: MeetingWithDocs;
  movedTo?: MeetingWithDocs | null;
}) {
  const called = meeting.status === "cancelled" || meeting.status === "rescheduled";
  return (
    <li className="py-6 first:pt-2 last:pb-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h4 className="text-lg font-semibold text-midnight">
          <Link
            href={`/public-meetings/${meeting.slug}`}
            className="underline-offset-2 hover:underline hover:text-eventide"
          >
            {formatMeetingDate(meeting.starts_at)}
          </Link>
        </h4>
        <p className="text-sm uppercase tracking-[0.12em] text-eventide font-medium">
          {MEETING_TYPE_LABELS[meeting.meeting_type]}
          {meeting.committee_name ? `, ${meeting.committee_name}` : ""}
        </p>
      </div>
      <p className="mt-1 text-sm text-midnight-75">
        {meeting.title}, {formatMeetingTime(meeting.starts_at, meeting.ends_at)}
      </p>
      <div className="mt-3">
        <StatusNote meeting={meeting} movedTo={movedTo} />
      </div>
      {meeting.public_note && <p className="mt-2 text-sm text-midnight-75">{meeting.public_note}</p>}
      <div className="mt-4">
        {called && meeting.docs.length === 0 ? null : <MeetingDocs meeting={meeting} />}
      </div>
    </li>
  );
}
