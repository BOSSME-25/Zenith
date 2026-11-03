import { CalendarDays, Clock, MapPin, Video } from "lucide-react";
import type { MeetingWithDocs } from "@/lib/meetings";
import {
  MEETING_TYPE_LABELS,
  formatMeetingDate,
  formatMeetingTime,
} from "@/lib/meetings-shared";
import { DocButton } from "./MeetingDocs";

/**
 * The next board meeting, on a midnight panel. It is never left blank: with no
 * meeting posted it says so, and says when notices go up.
 */
export function NextMeetingCard({ meeting }: { meeting: MeetingWithDocs | null }) {
  if (!meeting) {
    return (
      <div className="rounded-2xl bg-midnight p-8 md:p-10 text-white">
        <p className="eyebrow text-ion">Next board meeting</p>
        <h2 className="mt-3 text-2xl md:text-3xl font-bold text-white">
          No meeting is scheduled yet.
        </h2>
        <p className="mt-3 max-w-xl text-white/85 leading-relaxed">
          Notices are posted at least 24 hours ahead.
        </p>
      </div>
    );
  }

  const agenda = meeting.docs.find((d) => d.kind === "agenda");
  const physical = meeting.location_name || meeting.location_address;

  return (
    <div className="rounded-2xl bg-midnight p-8 md:p-10 text-white">
      <p className="eyebrow text-ion">
        {meeting.meeting_type === "committee" ? "Next committee meeting" : "Next board meeting"}
      </p>
      <h2 className="mt-3 flex items-start gap-3 text-3xl md:text-4xl font-bold leading-tight text-white">
        <CalendarDays className="mt-1.5 flex-none text-ion" size={28} aria-hidden />
        {formatMeetingDate(meeting.starts_at)}
      </h2>
      <p className="mt-2 text-lg text-white">
        <span className="font-semibold">{meeting.title}</span>
        {meeting.meeting_type !== "regular" && (
          <span className="text-white/85">, {MEETING_TYPE_LABELS[meeting.meeting_type]}</span>
        )}
      </p>

      <ul className="mt-6 space-y-3 text-white">
        <li className="flex items-start gap-3">
          <Clock size={20} className="mt-0.5 flex-none text-ion" aria-hidden />
          <span className="text-lg font-semibold">
            {formatMeetingTime(meeting.starts_at, meeting.ends_at)}
          </span>
        </li>
        {physical && (
          <li className="flex items-start gap-3">
            <MapPin size={20} className="mt-0.5 flex-none text-ion" aria-hidden />
            <span>
              {meeting.location_name && <span className="font-semibold">{meeting.location_name}</span>}
              {meeting.location_name && meeting.location_address && <br />}
              {meeting.location_address}
            </span>
          </li>
        )}
      </ul>

      {meeting.meeting_type === "emergency" && meeting.emergency_reason && (
        <p className="mt-6 rounded-xl bg-white/10 p-4 text-sm leading-relaxed text-white">
          <span className="font-semibold">Emergency meeting.</span> {meeting.emergency_reason}
        </p>
      )}
      {meeting.public_note && (
        <p className="mt-6 text-sm leading-relaxed text-white/90">{meeting.public_note}</p>
      )}

      <div className="mt-8 flex flex-wrap items-start gap-4">
        {meeting.virtual_url && (
          <div>
            <a
              href={meeting.virtual_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join online (opens in a new tab)"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-aurora px-6 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-aurora-75 transition-colors"
            >
              <Video size={18} aria-hidden /> Join online
            </a>
            <dl className="mt-3 space-y-0.5 text-sm text-white/90">
              {meeting.virtual_meeting_id && (
                <div className="flex gap-2">
                  <dt className="font-semibold">Meeting ID:</dt>
                  <dd>{meeting.virtual_meeting_id}</dd>
                </div>
              )}
              {meeting.virtual_passcode && (
                <div className="flex gap-2">
                  <dt className="font-semibold">Passcode:</dt>
                  <dd>{meeting.virtual_passcode}</dd>
                </div>
              )}
              {meeting.dial_in && (
                <div className="flex gap-2">
                  <dt className="font-semibold">Dial in:</dt>
                  <dd>{meeting.dial_in}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
        {!meeting.virtual_url && meeting.dial_in && (
          <p className="text-sm text-white/90">
            <span className="font-semibold">Dial in:</span> {meeting.dial_in}
          </p>
        )}
        {agenda ? (
          <DocButton
            doc={agenda}
            label="View agenda"
            className="border-white text-white hover:bg-white/10"
          />
        ) : (
          <p className="self-center text-sm text-white/85">
            The agenda is posted at least 24 hours before the meeting.
          </p>
        )}
      </div>
    </div>
  );
}
