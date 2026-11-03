/**
 * Meeting helpers with no server-only dependencies, shared by the public
 * pages, the admin screens and the client forms.
 *
 * Arizona does not observe daylight saving time, so America/Phoenix is a fixed
 * UTC-7 all year. That is why a time typed into the admin as "5:00 PM" can be
 * stored with a hard-coded -07:00 offset, and why the page can always say
 * "Arizona time" without a seasonal abbreviation.
 */

export const PHX_TZ = "America/Phoenix";
export const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_PDF_BYTES = 25 * 1024 * 1024;

export const MEETING_TYPES = [
  "regular",
  "special",
  "emergency",
  "committee",
  "budget_hearing",
  "work_session",
] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  regular: "Regular",
  special: "Special",
  emergency: "Emergency",
  committee: "Committee",
  budget_hearing: "Budget Hearing",
  work_session: "Work Session",
};

export const MEETING_STATUSES = ["draft", "scheduled", "cancelled", "rescheduled", "held"] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const MINUTES_STATUSES = ["none", "draft", "approved"] as const;
export type MinutesStatus = (typeof MINUTES_STATUSES)[number];

export const DOC_KINDS = ["agenda", "minutes", "packet", "other"] as const;
export type DocKind = (typeof DOC_KINDS)[number];

export const DOC_KIND_LABELS: Record<DocKind, string> = {
  agenda: "Agenda",
  minutes: "Minutes",
  packet: "Board packet",
  other: "Other document",
};

/** A meeting shown with no end time is treated as running this long. */
const DEFAULT_MEETING_LENGTH_MS = 3 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Time                                                                */
/* ------------------------------------------------------------------ */

type PhoenixParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function phoenixParts(date: Date): PhoenixParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PHX_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-11-12", the Arizona calendar date of an instant. */
export function phoenixDateKey(date: Date): string {
  const p = phoenixParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Value for a datetime-local input, in Arizona time. */
export function toPhoenixInput(date: Date): string {
  const p = phoenixParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

const INPUT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Reads a datetime-local value as Arizona time. Returns null when malformed. */
export function fromPhoenixInput(value: string): Date | null {
  if (!INPUT_RE.test(value)) return null;
  const d = new Date(`${value}:00-07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatMeetingDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: PHX_TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: PHX_TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function clock(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: PHX_TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "5:00 PM Arizona time", or "5:00 PM to 6:30 PM Arizona time". */
export function formatMeetingTime(start: Date, end?: Date | null): string {
  return end ? `${clock(start)} to ${clock(end)} Arizona time` : `${clock(start)} Arizona time`;
}

export function formatStamp(date: Date): string {
  return `${formatShortDate(date)}, ${clock(date)} Arizona time`;
}

/**
 * The school year a date falls in, given the month and day it starts.
 * Defaults to July 1 to June 30.
 */
export function schoolYearOf(
  date: Date,
  startMonth = 7,
  startDay = 1,
): { key: string; startYear: number } {
  const p = phoenixParts(date);
  const onOrAfterStart = p.month > startMonth || (p.month === startMonth && p.day >= startDay);
  const startYear = onOrAfterStart ? p.year : p.year - 1;
  return { key: `${startYear}-${pad((startYear + 1) % 100)}`, startYear };
}

/** The end of the Arizona day that is `n` working days after `dateKey`. */
export function endOfWorkingDay(dateKey: string, n: number): Date {
  let d = new Date(`${dateKey}T12:00:00-07:00`);
  let left = n;
  while (left > 0) {
    d = new Date(d.getTime() + DAY_MS);
    const dow = new Date(`${phoenixDateKey(d)}T12:00:00-07:00`).getUTCDay();
    // 12:00 in Phoenix is 19:00 UTC, so getUTCDay is the Arizona weekday.
    if (dow !== 0 && dow !== 6) left--;
  }
  return new Date(`${phoenixDateKey(d)}T23:59:59-07:00`);
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

export type MeetingTiming = {
  status: MeetingStatus;
  starts_at: Date;
  ends_at: Date | null;
};

export function meetingEnd(m: { starts_at: Date; ends_at: Date | null }): Date {
  return m.ends_at ?? new Date(m.starts_at.getTime() + DEFAULT_MEETING_LENGTH_MS);
}

/** A published meeting that is still ahead of us, or under way. */
export function isUpcoming(m: MeetingTiming, now = new Date()): boolean {
  return m.status === "scheduled" && meetingEnd(m).getTime() > now.getTime();
}

/** A scheduled meeting whose time has passed counts as held. */
export function effectiveStatus(m: MeetingTiming, now = new Date()): MeetingStatus {
  if (m.status === "scheduled" && meetingEnd(m).getTime() <= now.getTime()) return "held";
  return m.status;
}

/* ------------------------------------------------------------------ */
/* Slugs and file names                                                */
/* ------------------------------------------------------------------ */

export function meetingSlug(startsAt: Date, type: MeetingType): string {
  return `${phoenixDateKey(startsAt)}-${type.replace(/_/g, "-")}`;
}

/** zenith-board-agenda-2026-11-12, with -v2 for a replacement or a second file. */
export function documentBaseName(kind: DocKind, dateKey: string, version: number): string {
  return `zenith-board-${kind}-${dateKey}${version > 1 ? `-v${version}` : ""}`;
}

/**
 * Every meeting file lives under meetings/ with this naming pattern. The
 * upload route and the save action both check it, so the pattern holds even if
 * someone bypasses the form.
 */
export const MEETING_FILE_RE =
  /^meetings\/zenith-board-(agenda|minutes|packet|other|schedule)-\d{4}(-\d{2}){1,2}(-v\d+)?\.pdf$/;

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Only files in this project's Vercel Blob store are accepted as documents. */
export function isBlobUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function blobPathname(value: string): string {
  try {
    return decodeURIComponent(new URL(value).pathname.replace(/^\//, ""));
  } catch {
    return "";
  }
}
