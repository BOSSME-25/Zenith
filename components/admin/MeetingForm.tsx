"use client";

import { useState } from "react";
import { saveMeeting } from "@/app/actions/meeting";
import { useKeptFormAction } from "@/lib/use-kept-form";
import { idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  ATTENDANCE,
  ATTENDANCE_LABELS,
  MEETING_TYPES,
  MEETING_TYPE_LABELS,
  type Attendance,
  type MeetingFormValues,
  type MeetingType,
  formatMeetingDate,
  formatMeetingTime,
} from "@/lib/meetings-shared";

/** Every 15 minutes from 6:00 AM to 10:00 PM, plus the saved time if it falls between. */
function timeOptions(current: string): string[] {
  const out: string[] = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 15, 30, 45]) {
      if (h === 22 && m > 0) break;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  if (current && !out.includes(current)) out.push(current);
  return out.sort();
}

function timeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function MeetingForm({
  values,
  mode,
}: {
  values: MeetingFormValues;
  mode: "create" | "edit";
}) {
  const { state, pending, onSubmit } = useKeptFormAction(saveMeeting, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};
  const [type, setType] = useState<MeetingType>(values.meeting_type);
  const [attendance, setAttendance] = useState<Attendance>(values.attendance);
  const [startDate, setStartDate] = useState(values.starts_at.slice(0, 10));
  const [startTime, setStartTime] = useState(values.starts_at.slice(11, 16));
  const [endTime, setEndTime] = useState(values.ends_at.slice(11, 16));

  // A browser date-and-time box fills in the current time when someone picks
  // only a date, which once posted a notice for the wrong hour. The time is a
  // separate choice that starts empty, and this line shows how it will read.
  const startDt = startDate && startTime ? new Date(`${startDate}T${startTime}:00-07:00`) : null;
  const endDt = startDate && endTime ? new Date(`${startDate}T${endTime}:00-07:00`) : null;
  const preview =
    startDt && !Number.isNaN(startDt.getTime())
      ? endDt && endDt > startDt
        ? `${formatMeetingDate(startDt)}, ${formatMeetingTime(startDt, endDt)}`
        : endDt
          ? `${formatMeetingDate(startDt)}, ${formatMeetingTime(startDt)}. The end time is not after the start.`
          : `${formatMeetingDate(startDt)}, ${formatMeetingTime(startDt)}`
      : "";

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <fieldset className="space-y-5">
        <legend className="eyebrow text-eventide">Details</legend>
        <p className="text-sm text-midnight-75">
          Times are Arizona time. Do not convert anything.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="meeting_type">Type</label>
            <select
              id="meeting_type"
              name="meeting_type"
              value={type}
              onChange={(e) => setType(e.target.value as MeetingType)}
              className={inputClass}
            >
              {MEETING_TYPES.map((t) => (
                <option key={t} value={t}>{MEETING_TYPE_LABELS[t]}</option>
              ))}
            </select>
            <FieldError message={fe.meeting_type} />
          </div>
          <div>
            <label className={labelClass} htmlFor="title">Title</label>
            <input id="title" name="title" type="text" defaultValue={values.title} className={inputClass} />
            <FieldError message={fe.title} />
          </div>
        </div>

        {type === "committee" && (
          <div>
            <label className={labelClass} htmlFor="committee_name">Committee name</label>
            <input
              id="committee_name"
              name="committee_name"
              type="text"
              defaultValue={values.committee_name}
              className={inputClass}
            />
            <FieldError message={fe.committee_name} />
          </div>
        )}

        {type === "emergency" && (
          <div className="rounded-xl border border-red-300 bg-white p-4">
            <p className="text-sm text-midnight">
              Emergency meetings follow a separate, shorter notice path. Check with the board&apos;s
              counsel before using this type.
            </p>
            <label className={`${labelClass} mt-3`} htmlFor="emergency_reason">
              Reason for the emergency meeting
            </label>
            <textarea
              id="emergency_reason"
              name="emergency_reason"
              rows={3}
              defaultValue={values.emergency_reason}
              className={inputClass}
            />
            <FieldError message={fe.emergency_reason} />
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="start_date">Date</label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="start_time">Starts</label>
            <select
              id="start_time"
              name="start_time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            >
              <option value="">Choose a time</option>
              {timeOptions(startTime).map((t) => (
                <option key={t} value={t}>{timeLabel(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="end_time">Ends (optional)</label>
            <select
              id="end_time"
              name="end_time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClass}
            >
              <option value="">No end time</option>
              {timeOptions(endTime).map((t) => (
                <option key={t} value={t}>{timeLabel(t)}</option>
              ))}
            </select>
          </div>
        </div>
        <FieldError message={fe.starts_at || fe.ends_at} />
        <p
          aria-live="polite"
          className="rounded-xl border border-ion bg-ion-soft p-4 text-sm text-midnight"
        >
          {preview ? (
            <>
              <span className="font-semibold">The public page will say:</span> {preview}
            </>
          ) : (
            "Pick the date and choose a start time. The page shows exactly how it will read."
          )}
        </p>

        <div>
          <label className={labelClass} htmlFor="attendance">How will people attend?</label>
          <select
            id="attendance"
            name="attendance"
            value={attendance}
            onChange={(e) => setAttendance(e.target.value as Attendance)}
            className={inputClass}
          >
            {ATTENDANCE.map((a) => (
              <option key={a} value={a}>{ATTENDANCE_LABELS[a]}</option>
            ))}
          </select>
          <FieldError message={fe.attendance} />
        </div>

        {attendance !== "online" && (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="location_name">Where it is held</label>
              <input
                id="location_name"
                name="location_name"
                type="text"
                placeholder="Name of the place"
                defaultValue={values.location_name}
                className={inputClass}
              />
              <FieldError message={fe.location_name} />
            </div>
            <div>
              <label className={labelClass} htmlFor="location_address">Address</label>
              <input
                id="location_address"
                name="location_address"
                type="text"
                placeholder="Street, city, AZ ZIP"
                defaultValue={values.location_address}
                className={inputClass}
              />
              <FieldError message={fe.location_address} />
            </div>
          </div>
        )}

        {attendance !== "in_person" && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="virtual_url">Online link</label>
              <input
                id="virtual_url"
                name="virtual_url"
                type="url"
                placeholder="https://"
                defaultValue={values.virtual_url}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-midnight-75">
                The public page shows &ldquo;Online - Zoom&rdquo; for a Zoom link, and
                &ldquo;Online&rdquo; for any other.
              </p>
              <FieldError message={fe.virtual_url} />
            </div>
            <div>
              <label className={labelClass} htmlFor="virtual_meeting_id">Meeting ID</label>
              <input
                id="virtual_meeting_id"
                name="virtual_meeting_id"
                type="text"
                defaultValue={values.virtual_meeting_id}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="virtual_passcode">Passcode</label>
              <input
                id="virtual_passcode"
                name="virtual_passcode"
                type="text"
                defaultValue={values.virtual_passcode}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="dial_in">Dial-in number (optional)</label>
              <input id="dial_in" name="dial_in" type="text" defaultValue={values.dial_in} className={inputClass} />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="public_note">Note on the public page (optional)</label>
          <textarea
            id="public_note"
            name="public_note"
            rows={2}
            defaultValue={values.public_note}
            className={inputClass}
          />
          <FieldError message={fe.public_note} />
        </div>

        <div>
          <label className={labelClass} htmlFor="recording_url">Recording link (optional)</label>
          <input
            id="recording_url"
            name="recording_url"
            type="url"
            placeholder="https://"
            defaultValue={values.recording_url}
            className={inputClass}
          />
          <FieldError message={fe.recording_url} />
        </div>

        {mode === "create" && (
          <label className="flex items-start gap-3 rounded-xl border border-ion bg-ion-soft p-4 text-sm text-midnight cursor-pointer">
            <input type="checkbox" name="backfill" className="mt-1 h-4 w-4" />
            <span>
              <strong className="font-semibold">This meeting already happened.</strong> Add it
              straight to the archive, so you can attach its agenda and minutes. No notice is
              posted.
            </span>
          </label>
        )}
      </fieldset>

      <div className="space-y-4 border-t border-ion pt-6">
        <SubmitButton
          label={mode === "create" ? "Save as draft" : "Save changes"}
          pendingLabel="Saving…"
          pending={pending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-6 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-h-11"
        />
        <div role="status" aria-live="polite">
          <FormStatus state={state} />
        </div>
      </div>
    </form>
  );
}
