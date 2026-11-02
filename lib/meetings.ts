import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { safeSql, safeQuery } from "@/lib/db";
import {
  DAY_MS,
  type DocKind,
  type MeetingStatus,
  type MeetingType,
  type MinutesStatus,
} from "@/lib/meetings-shared";

/* ------------------------------------------------------------------ */
/* Rows                                                                */
/* ------------------------------------------------------------------ */

export type MeetingRow = {
  id: string;
  slug: string;
  title: string;
  meeting_type: MeetingType;
  committee_name: string | null;
  starts_at: Date;
  ends_at: Date | null;
  location_name: string | null;
  location_address: string | null;
  virtual_url: string | null;
  virtual_meeting_id: string | null;
  virtual_passcode: string | null;
  dial_in: string | null;
  status: MeetingStatus;
  rescheduled_to: string | null;
  status_reason: string | null;
  emergency_reason: string | null;
  notice_posted_at: Date | null;
  agenda_posted_at: Date | null;
  minutes_status: MinutesStatus;
  minutes_approved_at: Date | null;
  recording_url: string | null;
  public_note: string | null;
  created_at: Date;
  updated_at: Date;
};

export type DocRow = {
  id: string;
  meeting_id: string;
  kind: DocKind;
  label: string;
  blob_url: string;
  size_bytes: number | null;
  version: number;
  superseded_at: Date | null;
  withdrawn_at: Date | null;
  withdrawn_reason: string | null;
  uploaded_by: string | null;
  uploaded_at: Date;
};

export type AuditRow = {
  id: string;
  meeting_id: string | null;
  action: string;
  actor: string;
  detail: Record<string, unknown> | null;
  at: Date;
};

export const isActiveDoc = (d: DocRow) => !d.superseded_at && !d.withdrawn_at;

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

const optionalText = (max: number) => z.string().trim().max(max).default("");

/** The physical posting location the notice must name. Empty means not set. */
export const noticeLocationSchema = z.object({ location: optionalText(300) });

/** Who to contact for a reasonable accommodation, and how much notice to give. */
export const accommodationSchema = z.object({
  contact: optionalText(120),
  reach: optionalText(160),
  days: z.number().int().min(1).max(30).nullable().default(null),
});

/** The month and day the school year begins. July 1 by default. */
export const schoolYearSchema = z.object({
  month: z.number().int().min(1).max(12).default(7),
  day: z.number().int().min(1).max(31).default(1),
});

export const postersSchema = z.array(z.string().trim().min(1).max(80)).max(20);

export const schedulePdfSchema = z.object({
  url: z.string(),
  size: z.number().nullable().default(null),
  schoolYear: z.string().max(20),
});

export const nondiscriminationSchema = z.object({ text: optionalText(1200) });

const relativeOrHttps = z
  .string()
  .trim()
  .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//i.test(v), {
    message: "Use a full https:// link, or a page on this site that starts with /.",
  });

export const enrollmentPopupSchema = z.object({
  state: z.enum(["hidden", "coming_soon", "open", "closed"]).default("hidden"),
  eyebrow: z.string().trim().max(40).default(""),
  headline: z.string().trim().max(60).default(""),
  body: z.string().trim().max(220).default(""),
  ctaLabel: z.string().trim().max(30).default(""),
  ctaUrl: relativeOrHttps.optional(),
  imageUrl: z.string().trim().optional(),
  imageAlt: z.string().trim().max(140).default(""),
  showFrom: z.string().datetime().optional(),
  showUntil: z.string().datetime().optional(),
  rememberDismissDays: z.number().int().min(1).max(60).default(7),
});
export type EnrollmentPopup = z.infer<typeof enrollmentPopupSchema>;

export type SettingKey =
  | "notice_location"
  | "accommodation_contact"
  | "school_year_start"
  | "posters"
  | "schedule_pdf"
  | "nondiscrimination"
  | "enrollment_popup";

/**
 * Reads a setting, falling back to its default when the row is missing or the
 * table does not exist yet (a fresh deployment before /api/init is run).
 */
export async function getSetting<T>(
  key: SettingKey,
  schema: z.ZodType<T>,
  fallback: T,
): Promise<T> {
  try {
    const { rows } = await safeSql<{ value: unknown }>`
      SELECT value FROM site_settings WHERE key = ${key}
    `;
    if (rows.length === 0) return fallback;
    const parsed = schema.safeParse(rows[0].value);
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export async function saveSetting(key: SettingKey, value: unknown, actor: string | null) {
  await safeSql`
    INSERT INTO site_settings (key, value, updated_by, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${actor}, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = NOW()
  `;
}

export const getPosters = () => getSetting("posters", postersSchema, []);
export const getNoticeLocation = () =>
  getSetting("notice_location", noticeLocationSchema, { location: "" });
export const getAccommodation = () =>
  getSetting("accommodation_contact", accommodationSchema, {
    contact: "",
    reach: "",
    days: null,
  });
export const getSchoolYearStart = () =>
  getSetting("school_year_start", schoolYearSchema, { month: 7, day: 1 });
export const getSchedulePdf = () =>
  getSetting<z.infer<typeof schedulePdfSchema> | null>(
    "schedule_pdf",
    schedulePdfSchema.nullable(),
    null,
  );
export const getNondiscrimination = () =>
  getSetting("nondiscrimination", nondiscriminationSchema, { text: "" });

export const DEFAULT_POPUP: EnrollmentPopup = enrollmentPopupSchema.parse({
  state: "hidden",
  eyebrow: "OPENING AUGUST 2027",
  headline: "Our founding class is on the way",
  body: "Enrollment for ninth graders opens soon. Tell us you're interested and we'll reach you first.",
  ctaLabel: "Get on the list",
  ctaUrl: "/get-involved#family",
});

export const getEnrollmentPopup = () =>
  getSetting("enrollment_popup", enrollmentPopupSchema, DEFAULT_POPUP);

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

const MEETING_COLUMNS = `id, slug, title, meeting_type, committee_name, starts_at, ends_at,
  location_name, location_address, virtual_url, virtual_meeting_id, virtual_passcode, dial_in,
  status, rescheduled_to, status_reason, emergency_reason, notice_posted_at, agenda_posted_at,
  minutes_status, minutes_approved_at, recording_url, public_note, created_at, updated_at`;

export type MeetingWithDocs = MeetingRow & { docs: DocRow[] };

async function attachActiveDocs(meetings: MeetingRow[]): Promise<MeetingWithDocs[]> {
  if (meetings.length === 0) return [];
  const { rows } = await safeQuery<DocRow>(
    `SELECT * FROM meeting_documents
     WHERE meeting_id = ANY($1::uuid[]) AND superseded_at IS NULL AND withdrawn_at IS NULL
     ORDER BY uploaded_at ASC`,
    [meetings.map((m) => m.id)],
  );
  const byMeeting = new Map<string, DocRow[]>();
  for (const d of rows) {
    const list = byMeeting.get(d.meeting_id) ?? [];
    list.push(d);
    byMeeting.set(d.meeting_id, list);
  }
  return meetings.map((m) => ({ ...m, docs: byMeeting.get(m.id) ?? [] }));
}

/** Every meeting the public may see (anything past draft), newest first. */
export async function listPublicMeetings(): Promise<MeetingWithDocs[]> {
  const { rows } = await safeQuery<MeetingRow>(
    `SELECT ${MEETING_COLUMNS} FROM meetings WHERE status <> 'draft' ORDER BY starts_at DESC`,
  );
  return attachActiveDocs(rows);
}

export async function getPublicMeeting(slug: string): Promise<MeetingWithDocs | null> {
  const { rows } = await safeQuery<MeetingRow>(
    `SELECT ${MEETING_COLUMNS} FROM meetings WHERE slug = $1 AND status <> 'draft'`,
    [slug],
  );
  if (rows.length === 0) return null;
  return (await attachActiveDocs(rows))[0];
}

export async function listAdminMeetings(): Promise<MeetingWithDocs[]> {
  const { rows } = await safeQuery<MeetingRow>(
    `SELECT ${MEETING_COLUMNS} FROM meetings ORDER BY starts_at DESC LIMIT 500`,
  );
  return attachActiveDocs(rows);
}

export async function getAdminMeeting(id: string): Promise<{
  meeting: MeetingRow;
  docs: DocRow[];
  audit: AuditRow[];
} | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { rows } = await safeQuery<MeetingRow>(
    `SELECT ${MEETING_COLUMNS} FROM meetings WHERE id = $1`,
    [id],
  );
  if (rows.length === 0) return null;
  const docs = await safeQuery<DocRow>(
    `SELECT * FROM meeting_documents WHERE meeting_id = $1 ORDER BY kind, version DESC`,
    [id],
  );
  const audit = await safeQuery<AuditRow>(
    `SELECT * FROM meeting_audit WHERE meeting_id = $1 ORDER BY at DESC LIMIT 100`,
    [id],
  );
  return { meeting: rows[0], docs: docs.rows, audit: audit.rows };
}

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

export type NoticeCheck =
  | { ok: true; warning?: string }
  | { ok: false; message: string };

/**
 * The 24-hour rule. Enforced here, on the server, so it holds no matter how a
 * request arrives. Emergency meetings follow a separate notice path: they skip
 * the block but carry a warning to check with counsel.
 */
export function checkNoticeRule(
  type: MeetingType,
  startsAt: Date,
  now: Date = new Date(),
): NoticeCheck {
  if (type === "emergency") {
    return {
      ok: true,
      warning:
        "Emergency meetings follow a separate, shorter notice path. Check with the board's counsel before using this type.",
    };
  }
  if (startsAt.getTime() - now.getTime() < DAY_MS) {
    return {
      ok: false,
      message:
        "Notice must be posted at least 24 hours before the meeting. This meeting is too close to post as a regular meeting. Stop and call the Board Chair.",
    };
  }
  return { ok: true };
}

export async function writeAudit(
  meetingId: string | null,
  action: string,
  actor: string,
  detail?: Record<string, unknown>,
) {
  await safeSql`
    INSERT INTO meeting_audit (meeting_id, action, actor, detail)
    VALUES (${meetingId}, ${action}, ${actor}, ${detail ? JSON.stringify(detail) : null}::jsonb)
  `;
}

/** Publishing or changing a notice must show up immediately, not after a cache. */
export function revalidateMeetings(slug?: string, id?: string) {
  revalidatePath("/public-meetings");
  if (slug) revalidatePath(`/public-meetings/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/meetings");
  if (id) revalidatePath(`/admin/meetings/${id}`);
}
