"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { upload } from "@vercel/blob/client";
import {
  saveAccommodation,
  saveEnrollmentPopup,
  saveNondiscrimination,
  saveNoticeLocation,
  savePosters,
  saveSchedulePdf,
  saveSchoolYear,
} from "@/app/actions/settings";
import { useKeptFormAction } from "@/lib/use-kept-form";
import { type ActionState, idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { MAX_PDF_BYTES } from "@/lib/meetings-shared";
import { PostedBySelect } from "./PostedBySelect";

const BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-6 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-h-11";

function Card({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-ion p-6 md:p-8">
      <h2 className="text-lg font-semibold text-midnight">{title}</h2>
      {intro && <p className="mt-2 text-sm leading-relaxed text-midnight-75 max-w-2xl">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Footer({
  state,
  pending,
  posters,
  withPoster = true,
}: {
  state: ActionState;
  pending: boolean;
  posters: string[];
  withPoster?: boolean;
}) {
  const uid = useId();
  return (
    <div className="mt-5 space-y-4">
      {withPoster && (
        <div className="max-w-sm">
          <PostedBySelect posters={posters} id={`posted_by_${uid}`} />
        </div>
      )}
      <SubmitButton label="Save" pendingLabel="Saving…" pending={pending} className={BUTTON} />
      <div role="status" aria-live="polite">
        <FormStatus state={state} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function PostersForm({ names }: { names: string[] }) {
  const { state, pending, onSubmit } = useKeptFormAction(savePosters, idleState);
  return (
    <Card
      title="Who can post notices"
      intro="One name per line. Everyone who posts, cancels, or uploads picks their name from this list, and the name goes into the log next to a time the server records. Name at least two people, so a notice never depends on one person being available."
    >
      <form onSubmit={onSubmit}>
        <label className={labelClass} htmlFor="names">Names</label>
        <textarea
          id="names"
          name="names"
          rows={4}
          defaultValue={names.join("\n")}
          placeholder={"Secretary name\nBoard Chair name"}
          className={inputClass}
        />
        <Footer state={state} pending={pending} posters={[]} withPoster={false} />
      </form>
    </Card>
  );
}

export function NoticeLocationForm({ value, posters }: { value: string; posters: string[] }) {
  const { state, pending, onSubmit } = useKeptFormAction(saveNoticeLocation, idleState);
  return (
    <Card
      title="Where printed notices are posted"
      intro="The notice names this physical place as well as the website. Zenith has no school building yet, so the board designates a place by vote and records it in its minutes. Do not guess one. Until it is set, the page names the website only."
    >
      <form onSubmit={onSubmit}>
        <label className={labelClass} htmlFor="location">Place and address</label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={value}
          placeholder="Place name, street address, city, AZ ZIP"
          className={inputClass}
        />
        <Footer state={state} pending={pending} posters={posters} />
      </form>
    </Card>
  );
}

export function AccommodationForm({
  contact,
  reach,
  days,
  posters,
}: {
  contact: string;
  reach: string;
  days: number | null;
  posters: string[];
}) {
  const { state, pending, onSubmit } = useKeptFormAction(saveAccommodation, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};
  return (
    <Card
      title="Accommodation requests"
      intro="Optional, and the board decides. When all three are filled in, the page shows: To request a reasonable accommodation, contact [who] at [how] at least [N] business days before the meeting."
    >
      <form onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="contact">Name or role</label>
            <input id="contact" name="contact" type="text" defaultValue={contact} className={inputClass} />
            <FieldError message={fe.contact} />
          </div>
          <div>
            <label className={labelClass} htmlFor="reach">Email or phone</label>
            <input id="reach" name="reach" type="text" defaultValue={reach} className={inputClass} />
            <FieldError message={fe.reach} />
          </div>
          <div>
            <label className={labelClass} htmlFor="days">Business days ahead</label>
            <input
              id="days"
              name="days"
              type="number"
              min={1}
              max={30}
              defaultValue={days ?? ""}
              className={inputClass}
            />
            <FieldError message={fe.days} />
          </div>
        </div>
        <Footer state={state} pending={pending} posters={posters} />
      </form>
    </Card>
  );
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function SchoolYearForm({ month, day, posters }: { month: number; day: number; posters: string[] }) {
  const { state, pending, onSubmit } = useKeptFormAction(saveSchoolYear, idleState);
  return (
    <Card
      title="School year starts"
      intro="The archive groups meetings by school year. July 1 to June 30 unless the board says otherwise."
    >
      <form onSubmit={onSubmit}>
        <div className="flex flex-wrap gap-5">
          <div>
            <label className={labelClass} htmlFor="month">Month</label>
            <select id="month" name="month" defaultValue={month} className={inputClass}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="day">Day</label>
            <input id="day" name="day" type="number" min={1} max={31} defaultValue={day} className={inputClass} />
          </div>
        </div>
        <Footer state={state} pending={pending} posters={posters} />
      </form>
    </Card>
  );
}

export function SchedulePdfForm({
  current,
  nextBaseName,
  posters,
}: {
  current: { url: string; schoolYear: string } | null;
  nextBaseName: string;
  posters: string[];
}) {
  const [state, setState] = useState<ActionState>(idleState);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setState({ status: "error", message: "Choose a PDF first." });
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setState({ status: "error", message: "Only a PDF can be posted." });
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setState({ status: "error", message: "That file is over 25 MB." });
      return;
    }
    setBusy(true);
    setState(idleState);
    try {
      const blob = await upload(`meetings/${nextBaseName}.pdf`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: "application/pdf",
      });
      fd.delete("file");
      fd.set("blob_url", blob.url);
      fd.set("size_bytes", String(file.size));
      const result = await saveSchedulePdf(idleState, fd);
      setState(result);
      if (result.status === "success" && fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setState({
        status: "error",
        message: `The upload did not finish. ${err instanceof Error ? err.message : ""}`.trim(),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="Yearly meeting schedule"
      intro="Upload the year's schedule as a PDF each August. Nothing else is needed: the upcoming dates on the page come from the meetings you post."
    >
      {current && (
        <p className="mb-4 text-sm text-midnight">
          Current file:{" "}
          <a href={current.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-eventide underline">
            {current.schoolYear} schedule
          </a>
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="school_year" value={nextBaseName.replace("zenith-board-schedule-", "").replace(/-v\d+$/, "")} />
        <div>
          <label className={labelClass} htmlFor="schedule_file">PDF file</label>
          <input
            ref={fileRef}
            id="schedule_file"
            name="file"
            type="file"
            accept="application/pdf"
            className="block w-full text-sm text-midnight file:mr-4 file:rounded-full file:border-0 file:bg-ion file:px-4 file:py-2 file:text-sm file:font-semibold file:text-midnight hover:file:bg-ion-75"
          />
          <p className="mt-1.5 text-xs text-midnight-75">Saved as <code>{nextBaseName}.pdf</code>.</p>
        </div>
        <div className="max-w-sm">
          <PostedBySelect posters={posters} id="posted_by_schedule" />
        </div>
        <SubmitButton label="Upload schedule" pendingLabel="Uploading…" pending={busy} className={BUTTON} />
        <div role="status" aria-live="polite">
          <FormStatus state={state} />
        </div>
      </form>
    </Card>
  );
}

export function NondiscriminationForm({ text, posters }: { text: string; posters: string[] }) {
  const { state, pending, onSubmit } = useKeptFormAction(saveNondiscrimination, idleState);
  return (
    <Card
      title="Non-discrimination statement"
      intro="Optional. Only add the statement the board has adopted, word for word. Leave empty if there is none."
    >
      <form onSubmit={onSubmit}>
        <label className={labelClass} htmlFor="nd_text">Statement</label>
        <textarea id="nd_text" name="text" rows={4} defaultValue={text} className={inputClass} />
        <Footer state={state} pending={pending} posters={posters} />
      </form>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

export type PopupFormValues = {
  state: "hidden" | "coming_soon" | "open" | "closed";
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string;
  imageAlt: string;
  showFrom: string;
  showUntil: string;
  rememberDismissDays: number;
};

const SUGGESTED = {
  coming_soon: {
    eyebrow: "OPENING AUGUST 2027",
    headline: "Our founding class is on the way",
    body: "Enrollment for ninth graders opens soon. Tell us you're interested and we'll reach you first.",
    ctaLabel: "Get on the list",
    ctaUrl: "/get-involved#family",
  },
  open: {
    eyebrow: "ENROLLING FOR 2027-28",
    headline: "Join our founding class",
    body: "Zenith College and Career Prep opens in August 2027 for ninth graders in Maryvale. Early college courses, STEAM career paths, and a small school where every student is known.",
    ctaLabel: "Start your application",
    ctaUrl: "",
  },
} as const;

export function EnrollmentPopupForm({
  values,
  posters,
}: {
  values: PopupFormValues;
  posters: string[];
}) {
  const { state, pending, onSubmit } = useKeptFormAction(saveEnrollmentPopup, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState(values.imageUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function fill(kind: keyof typeof SUGGESTED) {
    const f = formRef.current;
    if (!f) return;
    for (const [name, value] of Object.entries(SUGGESTED[kind])) {
      const el = f.elements.namedItem(name);
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = value;
    }
  }

  async function onPhoto(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "photo";
      const blob = await upload(`site/enrollment-${safe}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      setImageUrl(blob.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "The photo did not upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card
      title="Open enrollment pop-up"
      intro={
        <>
          A pop-up that appears about a second and a half after a page loads, once per visit. If a
          visitor closes it, it stays away for the number of days below. It collects nothing: the
          button goes to the link you set. It never appears on the interest list page. Keep it{" "}
          <strong className="font-semibold">Hidden</strong> until the application or interest link
          works, and check every word against the charter terms before turning it on.
        </>
      }
    >
      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <input type="hidden" name="imageUrl" value={imageUrl} />

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="popup_state">Show the pop-up</label>
            <select id="popup_state" name="state" defaultValue={values.state} className={inputClass}>
              <option value="hidden">Hidden (off)</option>
              <option value="coming_soon">Coming soon</option>
              <option value="open">Open enrollment</option>
              <option value="closed">Closed (off)</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="rememberDismissDays">Stay away after it is closed (days)</label>
            <input
              id="rememberDismissDays"
              name="rememberDismissDays"
              type="number"
              min={1}
              max={60}
              defaultValue={values.rememberDismissDays}
              className={inputClass}
            />
            <FieldError message={fe.rememberDismissDays} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => fill("coming_soon")} className="rounded-full border border-ion px-4 py-2 text-sm font-semibold text-midnight hover:bg-ion-soft min-h-11">
            Fill in the suggested Coming soon wording
          </button>
          <button type="button" onClick={() => fill("open")} className="rounded-full border border-ion px-4 py-2 text-sm font-semibold text-midnight hover:bg-ion-soft min-h-11">
            Fill in the suggested Open wording
          </button>
        </div>
        <p className="mt-2 text-xs text-midnight-75">
          The suggested wording is a draft. Jay and the board approve it before it goes live.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="eyebrow">Small heading (up to 40)</label>
            <input id="eyebrow" name="eyebrow" type="text" maxLength={40} defaultValue={values.eyebrow} className={inputClass} />
            <FieldError message={fe.eyebrow} />
          </div>
          <div>
            <label className={labelClass} htmlFor="headline">Headline (up to 60)</label>
            <input id="headline" name="headline" type="text" maxLength={60} defaultValue={values.headline} className={inputClass} />
            <FieldError message={fe.headline} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="body">Text (up to 220)</label>
            <textarea id="body" name="body" rows={3} maxLength={220} defaultValue={values.body} className={inputClass} />
            <FieldError message={fe.body} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ctaLabel">Button label (up to 30)</label>
            <input id="ctaLabel" name="ctaLabel" type="text" maxLength={30} defaultValue={values.ctaLabel} className={inputClass} />
            <FieldError message={fe.ctaLabel} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ctaUrl">Button link</label>
            <input
              id="ctaUrl"
              name="ctaUrl"
              type="text"
              placeholder="https://... or /get-involved#family"
              defaultValue={values.ctaUrl}
              className={inputClass}
            />
            <FieldError message={fe.ctaUrl} />
          </div>
        </div>

        <div className="mt-5">
          <p className={labelClass}>Photo (optional)</p>
          <p className="text-xs text-midnight-75 mb-2">
            A real photo with no logo and no text on it. Do not use a picture that suggests the
            people in it are Zenith students. Without a photo the pop-up is a single panel.
          </p>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="mb-3 h-32 w-auto rounded-lg border border-ion object-cover" />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onPhoto(f);
              }}
              className="block text-sm text-midnight file:mr-4 file:rounded-full file:border-0 file:bg-ion file:px-4 file:py-2 file:text-sm file:font-semibold file:text-midnight hover:file:bg-ion-75"
            />
            {imageUrl && (
              <button type="button" onClick={() => setImageUrl("")} className="text-sm font-semibold text-red-700 underline min-h-11">
                Remove photo
              </button>
            )}
            {uploading && <span className="text-sm text-midnight-75">Uploading…</span>}
          </div>
          {uploadError && <p className="mt-1.5 text-sm text-red-600">{uploadError}</p>}
          <div className="mt-4">
            <label className={labelClass} htmlFor="imageAlt">Describe the photo (up to 140)</label>
            <input id="imageAlt" name="imageAlt" type="text" maxLength={140} defaultValue={values.imageAlt} className={inputClass} />
            <FieldError message={fe.imageAlt} />
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="showFrom">Start showing (optional, Arizona time)</label>
            <input id="showFrom" name="showFrom" type="datetime-local" defaultValue={values.showFrom} className={inputClass} />
            <FieldError message={fe.showFrom} />
          </div>
          <div>
            <label className={labelClass} htmlFor="showUntil">Stop showing (optional, Arizona time)</label>
            <input id="showUntil" name="showUntil" type="datetime-local" defaultValue={values.showUntil} className={inputClass} />
            <FieldError message={fe.showUntil} />
          </div>
        </div>

        <Footer state={state} pending={pending} posters={posters} />
      </form>
    </Card>
  );
}
