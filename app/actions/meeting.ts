"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeQuery, safeSql, isDbConfigured } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { type ActionState, fieldErrorsFromZod } from "@/lib/validators";
import {
  type MeetingRow,
  checkNoticeRule,
  getPosters,
  revalidateMeetings,
  writeAudit,
} from "@/lib/meetings";
import {
  DAY_MS,
  ATTENDANCE,
  MAX_PDF_BYTES,
  MEETING_FILE_RE,
  MEETING_TYPES,
  type DocKind,
  type MeetingType,
  blobPathname,
  documentBaseName,
  formatStamp,
  fromPhoenixInput,
  isBlobUrl,
  meetingSlug,
  phoenixDateKey,
} from "@/lib/meetings-shared";

async function assertAdmin() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

const NO_DB: ActionState = {
  status: "error",
  message: "The database is not configured, so meetings cannot be saved.",
};

const NEEDS_POSTER: ActionState = {
  status: "error",
  message:
    "Choose your name under Posted by. If the list is empty, add the people who post notices under Site settings first.",
};

/**
 * The admin is one shared password, so nothing identifies who acted. Every
 * change therefore names a person from a short list kept in Site settings, and
 * that name goes into the audit log next to the server's own timestamp.
 */
async function requirePoster(
  formData: FormData,
): Promise<{ ok: true; actor: string } | { ok: false; state: ActionState }> {
  const actor = String(formData.get("posted_by") ?? "").trim();
  const posters = await getPosters();
  if (!actor || !posters.includes(actor)) return { ok: false, state: NEEDS_POSTER };
  return { ok: true, actor };
}

const nullIfEmpty = (v: string) => (v.trim() === "" ? null : v.trim());

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https:\/\/\S+$/i.test(v), "Use a full https:// link.");

const meetingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Add a title, for example Regular Board Meeting.")
      .max(120, "Keep the title under 120 characters."),
    meeting_type: z.enum(MEETING_TYPES, { message: "Choose a meeting type." }),
    attendance: z.enum(ATTENDANCE, { message: "Say how people will attend." }),
    committee_name: z.string().trim().max(120),
    starts_at: z
      .string()
      .refine((v) => fromPhoenixInput(v) !== null, "Enter the date and start time."),
    ends_at: z
      .string()
      .refine((v) => v === "" || fromPhoenixInput(v) !== null, "Enter a valid end time."),
    location_name: z.string().trim().max(200),
    location_address: z.string().trim().max(300),
    virtual_url: optionalUrl,
    virtual_meeting_id: z.string().trim().max(80),
    virtual_passcode: z.string().trim().max(80),
    dial_in: z.string().trim().max(160),
    recording_url: optionalUrl,
    public_note: z.string().trim().max(500, "Keep the note under 500 characters."),
    emergency_reason: z.string().trim().max(500),
    backfill: z.boolean(),
  })
  .superRefine((m, ctx) => {
    if (m.meeting_type === "committee" && !m.committee_name) {
      ctx.addIssue({ code: "custom", path: ["committee_name"], message: "Name the committee." });
    }
    if (m.meeting_type === "emergency" && !m.emergency_reason) {
      ctx.addIssue({
        code: "custom",
        path: ["emergency_reason"],
        message: "An emergency meeting needs a written reason.",
      });
    }
    const physical = Boolean(m.location_name || m.location_address);
    if (m.attendance !== "online" && !physical) {
      ctx.addIssue({
        code: "custom",
        path: ["location_name"],
        message: "Say where the meeting is held.",
      });
    }
    if (m.attendance !== "in_person" && !m.virtual_url) {
      ctx.addIssue({
        code: "custom",
        path: ["virtual_url"],
        message: "Add the online link.",
      });
    }
    const start = fromPhoenixInput(m.starts_at);
    const end = m.ends_at ? fromPhoenixInput(m.ends_at) : null;
    if (start && end && end <= start) {
      ctx.addIssue({ code: "custom", path: ["ends_at"], message: "The end must be after the start." });
    }
    if (m.backfill && start && start.getTime() > Date.now()) {
      ctx.addIssue({
        code: "custom",
        path: ["starts_at"],
        message: "A meeting added to the archive must already have happened.",
      });
    }
  });

function parseMeeting(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "");
  return meetingSchema.safeParse({
    title: s("title"),
    meeting_type: s("meeting_type"),
    attendance: s("attendance") || "online",
    committee_name: s("committee_name"),
    starts_at: s("starts_at"),
    ends_at: s("ends_at"),
    location_name: s("location_name"),
    location_address: s("location_address"),
    virtual_url: s("virtual_url"),
    virtual_meeting_id: s("virtual_meeting_id"),
    virtual_passcode: s("virtual_passcode"),
    dial_in: s("dial_in"),
    recording_url: s("recording_url"),
    public_note: s("public_note"),
    emergency_reason: s("emergency_reason"),
    backfill: s("backfill") === "on",
  });
}

async function uniqueSlug(startsAt: Date, type: MeetingType, ignoreId?: string): Promise<string> {
  const base = meetingSlug(startsAt, type);
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const { rows } = await safeQuery(
      `SELECT 1 FROM meetings WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2::uuid)`,
      [candidate, ignoreId ?? null],
    );
    if (rows.length === 0) return candidate;
  }
  return `${base}-${Date.now()}`;
}

async function loadMeeting(id: string): Promise<MeetingRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { rows } = await safeQuery<MeetingRow>(`SELECT * FROM meetings WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

const same = (a: unknown, b: unknown) => {
  const norm = (v: unknown) => (v instanceof Date ? v.getTime() : (v ?? null));
  return norm(a) === norm(b);
};

/** Date, time, place, and type: the parts of a notice the public relies on. */
const NOTICE_FIELDS = [
  "meeting_type",
  "committee_name",
  "starts_at",
  "ends_at",
  "location_name",
  "location_address",
  "virtual_url",
  "virtual_meeting_id",
  "virtual_passcode",
  "dial_in",
] as const;

/* ------------------------------------------------------------------ */
/* Create and edit                                                     */
/* ------------------------------------------------------------------ */

export async function saveMeeting(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;

  const who = await requirePoster(formData);
  if (!who.ok) return who.state;

  const result = parseMeeting(formData);
  if (!result.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(result.error),
    };
  }
  const m = result.data;
  const startsAt = fromPhoenixInput(m.starts_at) as Date;
  const endsAt = m.ends_at ? fromPhoenixInput(m.ends_at) : null;
  const id = String(formData.get("id") ?? "");

  const values = {
    title: m.title,
    meeting_type: m.meeting_type,
    committee_name: m.meeting_type === "committee" ? nullIfEmpty(m.committee_name) : null,
    starts_at: startsAt,
    ends_at: endsAt,
    // Only what applies to how people attend is kept: an online-only meeting
    // has no place, and an in-person one has no link.
    location_name: m.attendance === "online" ? null : nullIfEmpty(m.location_name),
    location_address: m.attendance === "online" ? null : nullIfEmpty(m.location_address),
    virtual_url: m.attendance === "in_person" ? null : nullIfEmpty(m.virtual_url),
    virtual_meeting_id: m.attendance === "in_person" ? null : nullIfEmpty(m.virtual_meeting_id),
    virtual_passcode: m.attendance === "in_person" ? null : nullIfEmpty(m.virtual_passcode),
    dial_in: m.attendance === "in_person" ? null : nullIfEmpty(m.dial_in),
    recording_url: nullIfEmpty(m.recording_url),
    public_note: nullIfEmpty(m.public_note),
    emergency_reason: m.meeting_type === "emergency" ? nullIfEmpty(m.emergency_reason) : null,
  };

  /* ---- create ---- */
  if (!id) {
    const slug = await uniqueSlug(startsAt, m.meeting_type);
    const status = m.backfill ? "held" : "draft";
    const { rows } = await safeSql<{ id: string }>`
      INSERT INTO meetings (
        slug, title, meeting_type, committee_name, starts_at, ends_at,
        location_name, location_address, virtual_url, virtual_meeting_id, virtual_passcode, dial_in,
        recording_url, public_note, emergency_reason, status
      ) VALUES (
        ${slug}, ${values.title}, ${values.meeting_type}, ${values.committee_name},
        ${values.starts_at}, ${values.ends_at},
        ${values.location_name}, ${values.location_address}, ${values.virtual_url},
        ${values.virtual_meeting_id}, ${values.virtual_passcode}, ${values.dial_in},
        ${values.recording_url}, ${values.public_note}, ${values.emergency_reason}, ${status}
      ) RETURNING id
    `;
    const newId = rows[0].id;
    await writeAudit(newId, m.backfill ? "added_to_archive" : "created", who.actor, {
      status,
      starts_at: startsAt.toISOString(),
    });
    revalidateMeetings(slug, newId);
    redirect(`/admin/meetings/${newId}?created=1`);
  }

  /* ---- edit ---- */
  const existing = await loadMeeting(id);
  if (!existing) return { status: "error", message: "That meeting no longer exists." };

  const changed = NOTICE_FIELDS.filter(
    (f) => !same(existing[f], values[f as keyof typeof values]),
  );

  let warning: string | undefined;
  const upcoming = existing.starts_at.getTime() > Date.now();
  if (existing.status === "scheduled" && upcoming && changed.length > 0) {
    // The notice is already public, so changing when or where it is held is a
    // new notice and has to meet the same 24-hour rule.
    const check = checkNoticeRule(m.meeting_type, startsAt);
    if (!check.ok) {
      await writeAudit(existing.id, "blocked_change", who.actor, {
        fields: changed,
        attempted_start: startsAt.toISOString(),
        reason: "24-hour rule",
      });
      revalidateMeetings(undefined, existing.id);
      return {
        status: "error",
        message: check.message.replace("post as a regular meeting", "change as a regular meeting"),
        fieldErrors: { starts_at: "Too close to the meeting to change." },
      };
    }
    warning = check.warning;
  }

  // A draft has never been public, so its link can follow its date. Once
  // posted, the link is permanent: people put it in emails.
  const slug =
    existing.status === "draft" && !existing.notice_posted_at
      ? await uniqueSlug(startsAt, m.meeting_type, existing.id)
      : existing.slug;

  await safeSql`
    UPDATE meetings SET
      slug = ${slug}, title = ${values.title}, meeting_type = ${values.meeting_type},
      committee_name = ${values.committee_name}, starts_at = ${values.starts_at}, ends_at = ${values.ends_at},
      location_name = ${values.location_name}, location_address = ${values.location_address},
      virtual_url = ${values.virtual_url}, virtual_meeting_id = ${values.virtual_meeting_id},
      virtual_passcode = ${values.virtual_passcode}, dial_in = ${values.dial_in},
      recording_url = ${values.recording_url}, public_note = ${values.public_note},
      emergency_reason = ${values.emergency_reason}, updated_at = NOW()
    WHERE id = ${existing.id}
  `;

  const diff: Record<string, [unknown, unknown]> = {};
  for (const f of [...NOTICE_FIELDS, "title", "recording_url", "public_note"] as const) {
    const before = existing[f as keyof MeetingRow];
    const after = values[f as keyof typeof values];
    if (!same(before, after)) {
      diff[f] = [
        before instanceof Date ? before.toISOString() : before,
        after instanceof Date ? after.toISOString() : after,
      ];
    }
  }
  if (Object.keys(diff).length > 0) {
    await writeAudit(existing.id, "edited", who.actor, {
      changed: diff,
      status: existing.status,
      after_meeting: !upcoming,
    });
  }
  revalidateMeetings(existing.slug, existing.id);
  if (slug !== existing.slug) revalidateMeetings(slug, existing.id);

  return {
    status: "success",
    message: warning ? `Saved. ${warning}` : "Saved.",
  };
}

/* ------------------------------------------------------------------ */
/* Notice lifecycle                                                    */
/* ------------------------------------------------------------------ */

export async function publishNotice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requirePoster(formData);
  if (!who.ok) return who.state;

  const meeting = await loadMeeting(String(formData.get("id") ?? ""));
  if (!meeting) return { status: "error", message: "That meeting no longer exists." };
  if (meeting.status !== "draft") {
    return { status: "error", message: "Only a draft can be published." };
  }

  const check = checkNoticeRule(meeting.meeting_type, meeting.starts_at);
  if (!check.ok) {
    await writeAudit(meeting.id, "blocked_publish", who.actor, {
      attempted_start: meeting.starts_at.toISOString(),
      reason: "24-hour rule",
    });
    revalidateMeetings(undefined, meeting.id);
    return { status: "error", message: check.message };
  }

  // The server stamps the time. Nobody types it: it is the proof the notice
  // went up when it did.
  const { rows } = await safeSql<{ notice_posted_at: Date }>`
    UPDATE meetings
    SET status = 'scheduled', notice_posted_at = NOW(), updated_at = NOW()
    WHERE id = ${meeting.id} AND status = 'draft'
    RETURNING notice_posted_at
  `;
  if (rows.length === 0) return { status: "error", message: "That meeting was already published." };

  const { rows: agenda } = await safeQuery(
    `SELECT 1 FROM meeting_documents
     WHERE meeting_id = $1 AND kind = 'agenda' AND superseded_at IS NULL AND withdrawn_at IS NULL`,
    [meeting.id],
  );
  const noAgenda = agenda.length === 0;
  await writeAudit(meeting.id, "published", who.actor, {
    notice_posted_at: rows[0].notice_posted_at.toISOString(),
    without_agenda: noAgenda,
  });
  revalidateMeetings(meeting.slug, meeting.id);

  const notes = [`Notice posted ${formatStamp(rows[0].notice_posted_at)}.`];
  if (check.warning) notes.push(check.warning);
  if (noAgenda) {
    notes.push("There is no agenda yet. Upload it as soon as it is ready; it is due at least 24 hours before the meeting.");
  }
  notes.push("Now open the public page to check it, and post the printed notice at the physical location.");
  return { status: "success", message: notes.join(" ") };
}

export async function cancelMeeting(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requirePoster(formData);
  if (!who.ok) return who.state;

  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3) {
    return { status: "error", message: "Type the reason. The public page shows it." };
  }
  const meeting = await loadMeeting(String(formData.get("id") ?? ""));
  if (!meeting) return { status: "error", message: "That meeting no longer exists." };
  if (meeting.status !== "scheduled") {
    return {
      status: "error",
      message: "Only a posted meeting can be cancelled. A draft was never public; discard it instead.",
    };
  }
  await safeSql`
    UPDATE meetings SET status = 'cancelled', status_reason = ${reason}, updated_at = NOW()
    WHERE id = ${meeting.id}
  `;
  await writeAudit(meeting.id, "cancelled", who.actor, { reason });
  revalidateMeetings(meeting.slug, meeting.id);
  return {
    status: "success",
    message:
      "Cancelled. The public page now shows it as cancelled with your reason. Take down the printed notice and post a cancellation notice in its place.",
  };
}

export async function moveMeeting(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requirePoster(formData);
  if (!who.ok) return who.state;

  const meeting = await loadMeeting(String(formData.get("id") ?? ""));
  const target = await loadMeeting(String(formData.get("new_id") ?? ""));
  if (!meeting) return { status: "error", message: "That meeting no longer exists." };
  if (meeting.status !== "scheduled") {
    return { status: "error", message: "Only a posted meeting can be moved." };
  }
  if (!target || target.id === meeting.id) {
    return { status: "error", message: "Pick the meeting it moved to." };
  }
  if (target.status !== "scheduled") {
    return {
      status: "error",
      message: "Publish the new meeting first, then move this one to it.",
    };
  }
  await safeSql`
    UPDATE meetings
    SET status = 'rescheduled', rescheduled_to = ${target.id}, updated_at = NOW()
    WHERE id = ${meeting.id}
  `;
  await writeAudit(meeting.id, "rescheduled", who.actor, {
    moved_to: target.id,
    moved_to_start: target.starts_at.toISOString(),
  });
  revalidateMeetings(meeting.slug, meeting.id);
  revalidateMeetings(target.slug, target.id);
  return {
    status: "success",
    message: "Moved. The old meeting now reads as moved to the new date. Replace the printed notice.",
  };
}

export async function discardDraft(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requirePoster(formData);
  if (!who.ok) return who.state;

  const meeting = await loadMeeting(String(formData.get("id") ?? ""));
  if (!meeting) return { status: "error", message: "That meeting no longer exists." };
  const { rows: docs } = await safeQuery(`SELECT 1 FROM meeting_documents WHERE meeting_id = $1`, [
    meeting.id,
  ]);
  // Only a draft that was never posted and never held a file can go. Anything
  // else has been, or may become, a public record.
  if (meeting.status !== "draft" || meeting.notice_posted_at || docs.length > 0) {
    return {
      status: "error",
      message:
        "This meeting has been posted or has files attached, so it stays on record. Use Cancel instead.",
    };
  }
  await safeQuery(`DELETE FROM meeting_audit WHERE meeting_id = $1`, [meeting.id]);
  await safeQuery(`DELETE FROM meetings WHERE id = $1 AND status = 'draft'`, [meeting.id]);
  revalidateMeetings(meeting.slug);
  redirect("/admin/meetings");
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

const documentSchema = z.object({
  kind: z.enum(["agenda", "minutes", "packet", "other"]),
  label: z.string().trim().max(120),
  blob_url: z.string(),
  size_bytes: z.number().int().min(1).max(MAX_PDF_BYTES, "Files can be up to 25 MB."),
  minutes_status: z.enum(["draft", "approved"]).optional(),
  approved_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * Records a PDF that was already uploaded to Blob from the browser. The path
 * is re-checked here against the naming pattern, so a hand-built request cannot
 * attach an arbitrary link to a public record.
 */
export async function addMeetingDocument(formData: FormData): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requirePoster(formData);
  if (!who.ok) return who.state;

  const meeting = await loadMeeting(String(formData.get("id") ?? ""));
  if (!meeting) return { status: "error", message: "That meeting no longer exists." };

  const parsed = documentSchema.safeParse({
    kind: String(formData.get("kind") ?? ""),
    label: String(formData.get("label") ?? ""),
    blob_url: String(formData.get("blob_url") ?? ""),
    size_bytes: Number(formData.get("size_bytes") ?? 0),
    minutes_status: formData.get("minutes_status") ? String(formData.get("minutes_status")) : undefined,
    approved_on: formData.get("approved_on") ? String(formData.get("approved_on")) : undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "That file could not be attached.",
    };
  }
  const d = parsed.data;
  const kind = d.kind as DocKind;

  if ((kind === "packet" || kind === "other") && !d.label) {
    return { status: "error", message: "Give the document a short label." };
  }
  if (kind === "minutes") {
    if (!d.minutes_status) {
      return { status: "error", message: "Choose whether these minutes are a draft or approved." };
    }
    if (d.minutes_status === "approved") {
      if (!d.approved_on) {
        return { status: "error", message: "Enter the date the board approved the minutes." };
      }
      if (new Date(`${d.approved_on}T00:00:00-07:00`).getTime() > Date.now() + DAY_MS) {
        return { status: "error", message: "The approval date cannot be in the future." };
      }
    }
  }

  const { rows: versions } = await safeQuery<{ max: number | null }>(
    `SELECT MAX(version) AS max FROM meeting_documents WHERE meeting_id = $1 AND kind = $2`,
    [meeting.id, kind],
  );
  const nextVersion = (versions[0]?.max ?? 0) + 1;
  const expected = `meetings/${documentBaseName(kind, phoenixDateKey(meeting.starts_at), nextVersion)}.pdf`;
  const pathname = blobPathname(d.blob_url);
  if (!isBlobUrl(d.blob_url) || !MEETING_FILE_RE.test(pathname) || pathname !== expected) {
    return {
      status: "error",
      message: "That file did not upload the expected way. Reload the page and try again.",
    };
  }

  const defaultLabel = kind === "agenda" ? "Agenda" : kind === "minutes" ? "Minutes" : d.label;
  const label = kind === "agenda" || kind === "minutes" ? defaultLabel : d.label;

  const { rows } = await safeSql<{ id: string }>`
    INSERT INTO meeting_documents (meeting_id, kind, label, blob_url, size_bytes, version, uploaded_by)
    VALUES (${meeting.id}, ${kind}, ${label}, ${d.blob_url}, ${d.size_bytes}, ${nextVersion}, ${who.actor})
    RETURNING id
  `;
  const newDocId = rows[0].id;

  // Agenda and minutes keep one live version. The older file is superseded,
  // never deleted: it stays in storage and in the log.
  let replaced = false;
  if (kind === "agenda" || kind === "minutes") {
    const { rowCount } = await safeQuery(
      `UPDATE meeting_documents SET superseded_at = NOW()
       WHERE meeting_id = $1 AND kind = $2 AND id <> $3 AND superseded_at IS NULL AND withdrawn_at IS NULL`,
      [meeting.id, kind, newDocId],
    );
    replaced = (rowCount ?? 0) > 0;
  }

  let late = false;
  if (kind === "agenda") {
    await safeSql`
      UPDATE meetings SET agenda_posted_at = COALESCE(agenda_posted_at, NOW()), updated_at = NOW()
      WHERE id = ${meeting.id}
    `;
    late =
      meeting.status === "scheduled" &&
      meeting.starts_at.getTime() - Date.now() < DAY_MS &&
      meeting.starts_at.getTime() > Date.now();
  }
  if (kind === "minutes") {
    const approvedAt = d.minutes_status === "approved" ? new Date(`${d.approved_on}T12:00:00-07:00`) : null;
    await safeSql`
      UPDATE meetings
      SET minutes_status = ${d.minutes_status}, minutes_approved_at = ${approvedAt}, updated_at = NOW()
      WHERE id = ${meeting.id}
    `;
  }

  await writeAudit(meeting.id, replaced ? "document_replaced" : "document_added", who.actor, {
    kind,
    version: nextVersion,
    file: pathname,
    size_bytes: d.size_bytes,
    minutes_status: d.minutes_status ?? null,
    agenda_less_than_24h: late || undefined,
  });
  revalidateMeetings(meeting.slug, meeting.id);

  const base = replaced
    ? "Replaced. The earlier file is kept on record."
    : kind === "minutes"
      ? d.minutes_status === "approved"
        ? "Approved minutes posted."
        : "Draft minutes posted. The page labels them as pending board approval."
      : "Added.";
  return {
    status: "success",
    message: late
      ? `${base} This agenda went up less than 24 hours before the meeting. Tell the Board Chair.`
      : base,
  };
}

export async function withdrawDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requirePoster(formData);
  if (!who.ok) return who.state;

  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3) return { status: "error", message: "Type the reason for withdrawing it." };

  const docId = String(formData.get("doc_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(docId)) return { status: "error", message: "Missing document." };
  const { rows } = await safeQuery<{ id: string; meeting_id: string; kind: DocKind; label: string }>(
    `UPDATE meeting_documents SET withdrawn_at = NOW(), withdrawn_reason = $2
     WHERE id = $1 AND withdrawn_at IS NULL
     RETURNING id, meeting_id, kind, label`,
    [docId, reason],
  );
  if (rows.length === 0) return { status: "error", message: "That file was already withdrawn." };
  const doc = rows[0];

  if (doc.kind === "minutes") {
    const { rows: left } = await safeQuery(
      `SELECT 1 FROM meeting_documents
       WHERE meeting_id = $1 AND kind = 'minutes' AND superseded_at IS NULL AND withdrawn_at IS NULL`,
      [doc.meeting_id],
    );
    if (left.length === 0) {
      await safeSql`
        UPDATE meetings SET minutes_status = 'none', minutes_approved_at = NULL, updated_at = NOW()
        WHERE id = ${doc.meeting_id}
      `;
    }
  }
  await writeAudit(doc.meeting_id, "document_withdrawn", who.actor, {
    document_id: doc.id,
    kind: doc.kind,
    reason,
  });
  const meeting = await loadMeeting(doc.meeting_id);
  revalidateMeetings(meeting?.slug, doc.meeting_id);
  return {
    status: "success",
    message: "Withdrawn. It no longer shows on the public page. The file and your reason stay on record.",
  };
}
