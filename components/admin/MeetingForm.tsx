"use client";

import { useState } from "react";
import { saveMeeting } from "@/app/actions/meeting";
import { useKeptFormAction } from "@/lib/use-kept-form";
import { idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { MEETING_TYPES, MEETING_TYPE_LABELS, type MeetingType } from "@/lib/meetings-shared";
import { PostedBySelect } from "./PostedBySelect";

export type MeetingFormValues = {
  id?: string;
  title: string;
  meeting_type: MeetingType;
  committee_name: string;
  starts_at: string; // datetime-local value, Arizona time
  ends_at: string;
  location_name: string;
  location_address: string;
  virtual_url: string;
  virtual_meeting_id: string;
  virtual_passcode: string;
  dial_in: string;
  recording_url: string;
  public_note: string;
  emergency_reason: string;
};

export const EMPTY_MEETING: MeetingFormValues = {
  title: "Regular Board Meeting",
  meeting_type: "regular",
  committee_name: "",
  starts_at: "",
  ends_at: "",
  location_name: "",
  location_address: "",
  virtual_url: "",
  virtual_meeting_id: "",
  virtual_passcode: "",
  dial_in: "",
  recording_url: "",
  public_note: "",
  emergency_reason: "",
};

export function MeetingForm({
  values,
  posters,
  mode,
}: {
  values: MeetingFormValues;
  posters: string[];
  mode: "create" | "edit";
}) {
  const { state, pending, onSubmit } = useKeptFormAction(saveMeeting, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};
  const [type, setType] = useState<MeetingType>(values.meeting_type);

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

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="starts_at">Starts</label>
            <input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              defaultValue={values.starts_at}
              className={inputClass}
            />
            <FieldError message={fe.starts_at} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ends_at">Ends (optional)</label>
            <input
              id="ends_at"
              name="ends_at"
              type="datetime-local"
              defaultValue={values.ends_at}
              className={inputClass}
            />
            <FieldError message={fe.ends_at} />
          </div>
        </div>

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

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="virtual_url">Online link (if also online)</label>
            <input
              id="virtual_url"
              name="virtual_url"
              type="url"
              placeholder="https://"
              defaultValue={values.virtual_url}
              className={inputClass}
            />
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
            <label className={labelClass} htmlFor="dial_in">Dial-in number</label>
            <input id="dial_in" name="dial_in" type="text" defaultValue={values.dial_in} className={inputClass} />
          </div>
        </div>

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
        <div className="max-w-sm">
          <PostedBySelect posters={posters} />
        </div>
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
