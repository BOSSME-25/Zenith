"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2, X } from "lucide-react";
import { idleState, type ActionState, type IssueEvent } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";

export type IssueDefaults = {
  issue_number?: number;
  month_label?: string;
  published?: boolean;
  hero_image_url?: string;
  hero_title?: string;
  hero_text?: string;
  hero_cta_label?: string;
  hero_cta_url?: string;
  founder_note?: string;
  spotlight_image_url?: string;
  spotlight_name?: string;
  spotlight_text?: string;
  events?: IssueEvent[];
  classroom_title?: string;
  classroom_text?: string;
  stat_value?: string;
  stat_text?: string;
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: IssueDefaults;
  submitLabel: string;
  hiddenFields?: Record<string, string>;
};

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

function ImageField({
  name,
  label,
  hint,
  defaultUrl,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultUrl?: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const blob = await upload(`newsletter/${sanitizeName(file.name) || "image"}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      setUrl(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <input type="hidden" name={name} value={url} />
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <div className="flex items-center gap-3">
        {url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt="" className="h-16 w-24 rounded-lg object-cover border border-ion" />
        ) : (
          <div className="h-16 w-24 rounded-lg border border-dashed border-ion bg-ion-soft" aria-hidden />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full border border-ion bg-white px-3.5 py-1.5 text-xs font-semibold text-midnight hover:border-eventide disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden /> Uploading…
              </>
            ) : (
              <>
                <ImagePlus size={14} aria-hidden /> {url ? "Replace photo" : "Upload photo"}
              </>
            )}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <X size={12} aria-hidden /> Remove
            </button>
          )}
        </div>
      </div>
      {hint && <p className="mt-1.5 text-xs text-midnight-75">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SectionCard({ title, blurb, children }: { title: string; blurb?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl bg-white border border-ion p-6 md:p-7 space-y-4">
      <legend className="sr-only">{title}</legend>
      <div>
        <p className="eyebrow text-eventide">{title}</p>
        {blurb && <p className="mt-1 text-sm text-midnight-75">{blurb}</p>}
      </div>
      {children}
    </fieldset>
  );
}

const EVENT_SLOTS = [0, 1, 2];

export function IssueForm({ action, defaults, submitLabel, hiddenFields }: Props) {
  const [state, dispatch] = useActionState(action, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};
  const events = defaults?.events ?? [];

  return (
    <form action={dispatch} className="space-y-6">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

      <SectionCard title="Issue" blurb="Shown at the top of the newsletter, e.g. “Issue 01 • September 2027.”">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="issue_number">Issue number</label>
            <input
              id="issue_number"
              name="issue_number"
              type="number"
              min={1}
              required
              defaultValue={defaults?.issue_number ?? ""}
              className={inputClass}
            />
            <FieldError message={fe.issue_number} />
          </div>
          <div>
            <label className={labelClass} htmlFor="month_label">Month label</label>
            <input
              id="month_label"
              name="month_label"
              type="text"
              required
              placeholder="September 2027"
              defaultValue={defaults?.month_label ?? ""}
              className={inputClass}
            />
            <FieldError message={fe.month_label} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Top story"
        blurb="The big headline and lead photo. Keep the text to a sentence or two — what would a parent care about most?"
      >
        <ImageField
          name="hero_image_url"
          label="Lead photo"
          hint="Wide photos look best here (landscape orientation)."
          defaultUrl={defaults?.hero_image_url}
        />
        <div>
          <label className={labelClass} htmlFor="hero_title">Headline</label>
          <input
            id="hero_title"
            name="hero_title"
            type="text"
            required
            placeholder="Our founding class of Comets is taking shape"
            defaultValue={defaults?.hero_title ?? ""}
            className={inputClass}
          />
          <FieldError message={fe.hero_title} />
        </div>
        <div>
          <label className={labelClass} htmlFor="hero_text">Lead text</label>
          <textarea
            id="hero_text"
            name="hero_text"
            rows={3}
            defaultValue={defaults?.hero_text ?? ""}
            className={inputClass}
          />
          <FieldError message={fe.hero_text} />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="hero_cta_label">Button text <span className="font-normal text-midnight-50">(optional)</span></label>
            <input
              id="hero_cta_label"
              name="hero_cta_label"
              type="text"
              placeholder="Reserve a 9th grade seat"
              defaultValue={defaults?.hero_cta_label ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="hero_cta_url">Button link <span className="font-normal text-midnight-50">(optional)</span></label>
            <input
              id="hero_cta_url"
              name="hero_cta_url"
              type="text"
              placeholder="/get-involved#family"
              defaultValue={defaults?.hero_cta_url ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="From Dr. Samant"
        blurb="A short, warm note from the founder. Two or three sentences that sound like a person, not a press release."
      >
        <div>
          <label className={labelClass} htmlFor="founder_note">Founder note</label>
          <textarea
            id="founder_note"
            name="founder_note"
            rows={4}
            defaultValue={defaults?.founder_note ?? ""}
            className={inputClass}
          />
          <FieldError message={fe.founder_note} />
        </div>
      </SectionCard>

      <SectionCard
        title="Comet Spotlight"
        blurb="A student (or future student/family) to feature. Photos of real people drive the most shares."
      >
        <ImageField
          name="spotlight_image_url"
          label="Spotlight photo"
          defaultUrl={defaults?.spotlight_image_url}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="spotlight_name">Name &amp; grade</label>
            <input
              id="spotlight_name"
              name="spotlight_name"
              type="text"
              placeholder="Student Name, Grade 9"
              defaultValue={defaults?.spotlight_name ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="spotlight_text">Spotlight text</label>
          <textarea
            id="spotlight_text"
            name="spotlight_text"
            rows={3}
            defaultValue={defaults?.spotlight_text ?? ""}
            className={inputClass}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="What's Happening"
        blurb="Up to three upcoming events. Leave a slot's title empty to skip it."
      >
        <div className="space-y-5">
          {EVENT_SLOTS.map((i) => {
            const ev = events[i];
            return (
              <div key={i} className="rounded-xl border border-ion bg-ion-soft/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-eventide">Event {i + 1}</p>
                <div className="grid gap-3 sm:grid-cols-[6rem_5rem_1fr]">
                  <div>
                    <label className={labelClass} htmlFor={`events_${i}_month`}>Month</label>
                    <input
                      id={`events_${i}_month`}
                      name={`events_${i}_month`}
                      type="text"
                      placeholder="SEP"
                      defaultValue={ev?.month ?? ""}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`events_${i}_day`}>Day</label>
                    <input
                      id={`events_${i}_day`}
                      name={`events_${i}_day`}
                      type="text"
                      placeholder="12"
                      defaultValue={ev?.day ?? ""}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`events_${i}_title`}>Event title</label>
                    <input
                      id={`events_${i}_title`}
                      name={`events_${i}_title`}
                      type="text"
                      placeholder="Family Information Night"
                      defaultValue={ev?.title ?? ""}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor={`events_${i}_detail`}>Details</label>
                    <input
                      id={`events_${i}_detail`}
                      name={`events_${i}_detail`}
                      type="text"
                      placeholder="6:00 PM, Maryvale. RSVP by Sep 9"
                      defaultValue={ev?.detail ?? ""}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`events_${i}_url`}>Link <span className="font-normal text-midnight-50">(optional)</span></label>
                    <input
                      id={`events_${i}_url`}
                      name={`events_${i}_url`}
                      type="text"
                      placeholder="/get-involved"
                      defaultValue={ev?.url ?? ""}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Inside the Classroom"
        blurb="A short look at a project — give parents something concrete to ask their student about at dinner."
      >
        <div>
          <label className={labelClass} htmlFor="classroom_title">Section headline</label>
          <input
            id="classroom_title"
            name="classroom_title"
            type="text"
            placeholder="What our students are building this month"
            defaultValue={defaults?.classroom_title ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="classroom_text">Text</label>
          <textarea
            id="classroom_text"
            name="classroom_text"
            rows={3}
            defaultValue={defaults?.classroom_text ?? ""}
            className={inputClass}
          />
        </div>
      </SectionCard>

      <SectionCard title="Big number" blurb="One milestone, stated plainly — e.g. “100%” + a sentence.">
        <div className="grid gap-5 md:grid-cols-[10rem_1fr]">
          <div>
            <label className={labelClass} htmlFor="stat_value">Number</label>
            <input
              id="stat_value"
              name="stat_value"
              type="text"
              placeholder="100%"
              defaultValue={defaults?.stat_value ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="stat_text">Sentence</label>
            <input
              id="stat_text"
              name="stat_text"
              type="text"
              placeholder="of our model is built around college and career readiness."
              defaultValue={defaults?.stat_text ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      <div className="rounded-2xl bg-white border border-ion p-6 flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 rounded-lg border border-ion bg-white px-4 py-3 cursor-pointer hover:border-eventide">
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaults?.published ?? false}
            className="accent-midnight"
          />
          <span className="text-sm font-medium text-midnight">Published (visible on the site)</span>
        </label>
        <SubmitButton label={submitLabel} />
        <Link href="/admin/newsletter" className="text-sm font-semibold text-eventide hover:underline">
          Cancel
        </Link>
      </div>
      <FormStatus state={state} />
    </form>
  );
}
