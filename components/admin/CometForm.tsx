"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2 } from "lucide-react";
import { saveCometProfile } from "@/app/actions/nomination";
import {
  COMET_STATUSES,
  MILESTONE_LABELS,
  MILESTONE_TYPES,
  idleState,
} from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";

export type CometFormValues = {
  id: number;
  status: string;
  name: string;
  photo_url: string | null;
  grad_year: number | null;
  current_grade: number | null;
  milestone_type: string;
  headline: string;
  full_story: string;
  certifications: string[];
  field_or_institution: string | null;
  current_role_or_program: string | null;
  mentor_opt_in: boolean;
  tags: string[];
  consent_on_file: boolean;
  consent_recorded_by: string | null;
  featured_quarter: string | null;
};

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-").slice(0, 80);
}

const STATUS_LABELS: Record<string, string> = {
  in_motion: "In Motion (currently enrolled)",
  landed: "Landed (graduated)",
};

export function CometForm({ comet }: { comet: CometFormValues }) {
  const [state, dispatch] = useActionState(saveCometProfile, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};
  const [photoUrl, setPhotoUrl] = useState(comet.photo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [consent, setConsent] = useState(comet.consent_on_file);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const blob = await upload(`comets/${sanitizeName(file.name) || "photo"}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      setPhotoUrl(blob.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Photo upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={dispatch} className="space-y-6">
      <input type="hidden" name="id" value={comet.id} />
      <input type="hidden" name="photo_url" value={photoUrl} />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Name <span aria-hidden className="text-red-600">*</span>
          </label>
          <input id="name" name="name" defaultValue={comet.name} required className={inputClass} />
          <FieldError message={fe.name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="status">
            Section
          </label>
          <select id="status" name="status" defaultValue={comet.status} className={inputClass}>
            {COMET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Photo</label>
        <div className="flex items-center gap-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover border border-ion"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-ion-soft border border-ion grid place-items-center text-xs text-midnight-50">
              None
            </div>
          )}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-ion px-4 py-2 text-sm font-semibold text-midnight hover:bg-ion-soft disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={15} aria-hidden className="animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <ImagePlus size={15} aria-hidden /> Upload photo
              </>
            )}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={() => setPhotoUrl("")}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Remove
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </div>
        {uploadError && <p className="mt-1.5 text-sm text-red-600">{uploadError}</p>}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="current_grade">
            Current grade
          </label>
          <input
            id="current_grade"
            name="current_grade"
            inputMode="numeric"
            placeholder="9–12"
            defaultValue={comet.current_grade ?? ""}
            className={inputClass}
          />
          <FieldError message={fe.current_grade} />
        </div>
        <div>
          <label className={labelClass} htmlFor="grad_year">
            Graduation year
          </label>
          <input
            id="grad_year"
            name="grad_year"
            inputMode="numeric"
            placeholder="2031"
            defaultValue={comet.grad_year ?? ""}
            className={inputClass}
          />
          <FieldError message={fe.grad_year} />
        </div>
        <div>
          <label className={labelClass} htmlFor="milestone_type">
            Milestone
          </label>
          <select
            id="milestone_type"
            name="milestone_type"
            defaultValue={comet.milestone_type}
            className={inputClass}
          >
            {MILESTONE_TYPES.map((m) => (
              <option key={m} value={m}>
                {MILESTONE_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="headline">
          Headline <span aria-hidden className="text-red-600">*</span>
        </label>
        <input
          id="headline"
          name="headline"
          defaultValue={comet.headline}
          required
          className={inputClass}
        />
        <p className="mt-1.5 text-sm text-midnight-75">The short line shown on the card.</p>
        <FieldError message={fe.headline} />
      </div>

      <div>
        <label className={labelClass} htmlFor="full_story">
          Full story
        </label>
        <textarea
          id="full_story"
          name="full_story"
          rows={6}
          defaultValue={comet.full_story}
          className={inputClass}
        />
        <FieldError message={fe.full_story} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="field_or_institution">
            Field or institution
          </label>
          <input
            id="field_or_institution"
            name="field_or_institution"
            defaultValue={comet.field_or_institution ?? ""}
            placeholder="e.g. Phoenix College, HVAC program"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="current_role_or_program">
            Current role or program
          </label>
          <input
            id="current_role_or_program"
            name="current_role_or_program"
            defaultValue={comet.current_role_or_program ?? ""}
            placeholder="e.g. Apprentice Electrician, Rosendin"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="certifications">
            Certifications
          </label>
          <input
            id="certifications"
            name="certifications"
            defaultValue={comet.certifications?.join(", ") ?? ""}
            placeholder="CNA, OSHA 10"
            className={inputClass}
          />
          <p className="mt-1.5 text-sm text-midnight-75">Separate with commas.</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="tags">
            Field tags
          </label>
          <input
            id="tags"
            name="tags"
            defaultValue={comet.tags?.join(", ") ?? ""}
            placeholder="Healthcare, Skilled Trades"
            className={inputClass}
          />
          <p className="mt-1.5 text-sm text-midnight-75">
            Used by the &ldquo;browse by field&rdquo; filter. Separate with commas.
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="featured_quarter">
          Featured quarter
        </label>
        <input
          id="featured_quarter"
          name="featured_quarter"
          defaultValue={comet.featured_quarter ?? ""}
          placeholder="2027-Q3"
          className={inputClass}
        />
        <p className="mt-1.5 text-sm text-midnight-75">
          Optional. Featured Comets sort to the top of the public page.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-ion bg-white p-4">
        <input
          type="checkbox"
          name="mentor_opt_in"
          defaultChecked={comet.mentor_opt_in}
          className="mt-1 h-4 w-4 accent-eventide"
        />
        <span className="text-sm text-midnight">
          <strong>Available as a mentor.</strong> Adds a &ldquo;Connect with&rdquo; button to their
          card. Messages are emailed to the school, never to their own address.
        </span>
      </label>

      {/* Consent gate. Publishing is refused server-side without this. */}
      <fieldset className="rounded-xl border-2 border-eventide/40 bg-ion-soft p-5">
        <legend className="px-2 text-sm font-semibold text-midnight">Consent</legend>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="consent_on_file"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-eventide"
          />
          <span className="text-sm text-midnight">
            <strong>A signed release is on file for this person.</strong> For anyone under 18 this
            must be parent or guardian sign-off, not the student&apos;s own consent. This profile
            cannot be published without it, and unchecking it unpublishes the profile immediately.
          </span>
        </label>
        <div className="mt-4">
          <label className={labelClass} htmlFor="consent_recorded_by">
            Who signed, and when
          </label>
          <input
            id="consent_recorded_by"
            name="consent_recorded_by"
            defaultValue={comet.consent_recorded_by ?? ""}
            placeholder="e.g. Maria Lopez (parent), signed 03/14/2028"
            className={inputClass}
          />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton label="Save profile" />
        <Link href="/admin/comets" className="text-sm font-semibold text-eventide hover:text-midnight">
          Back to Comets
        </Link>
      </div>
      <FormStatus state={state} />
    </form>
  );
}
