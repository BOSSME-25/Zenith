"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeSql, safeQuery, isDbConfigured } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { sendNominationEmails, sendMentorConnectEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  checkNominationRateLimit,
  clientIpFrom,
  recordNominationAttempt,
} from "@/lib/rate-limit";
import {
  type ActionState,
  type CometStatus,
  MILESTONE_LABELS,
  type MilestoneType,
  RELATIONSHIP_LABELS,
  cometProfileSchema,
  fieldErrorsFromZod,
  mentorConnectSchema,
  nominationSchema,
  parseList,
} from "@/lib/validators";

/** Minimum time a human plausibly needs to complete the form. */
const MIN_SUBMISSION_MS = 3000;

const GENERIC_REJECTION =
  "We couldn't accept that submission. Please refresh the page and try again.";

async function assertAdmin() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}

// ---------------------------------------------------------------------------
// Public: nomination submission
// ---------------------------------------------------------------------------

export async function submitNomination(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Layer 1 — honeypot. Real browsers leave the off-screen field empty.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    return { status: "error", message: GENERIC_REJECTION };
  }

  // Layer 2 — time trap. The client stamps form-load time; we compare here so
  // the elapsed value is never something the form itself can assert directly.
  const loadedAt = Number(formData.get("form_loaded_at") ?? 0);
  const durationMs = Number.isFinite(loadedAt) && loadedAt > 0 ? Date.now() - loadedAt : 0;
  if (durationMs > 0 && durationMs < MIN_SUBMISSION_MS) {
    return { status: "error", message: GENERIC_REJECTION };
  }

  const requestHeaders = await headers();
  const ip = clientIpFrom(requestHeaders);

  // Layer 3 — Turnstile.
  const turnstile = await verifyTurnstile(
    String(formData.get("cf-turnstile-response") ?? "") || null,
    ip,
  );
  if (!turnstile.ok) {
    return {
      status: "error",
      message: "We couldn't verify that you're human. Please complete the check and try again.",
    };
  }

  // Layer 4 — rate limit.
  const limit = await checkNominationRateLimit(ip);
  if (!limit.allowed) {
    return {
      status: "error",
      message:
        "You've submitted several nominations recently. Please try again later, or email us directly.",
    };
  }

  const parsed = nominationSchema.safeParse({
    nominee_name: String(formData.get("nominee_name") ?? ""),
    nominee_grade_or_grad_year: String(formData.get("nominee_grade_or_grad_year") ?? ""),
    nominator_name: String(formData.get("nominator_name") ?? ""),
    nominator_relationship: String(formData.get("nominator_relationship") ?? ""),
    nominator_email: String(formData.get("nominator_email") ?? ""),
    milestone_type: String(formData.get("milestone_type") ?? ""),
    description: String(formData.get("description") ?? ""),
    nominee_contact_info: String(formData.get("nominee_contact_info") ?? ""),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const data = parsed.data;

  try {
    // Layer 5 — every nomination lands as 'pending'. Nothing reaches the public
    // site without a staff approval and consent on file.
    if (isDbConfigured()) {
      await safeSql`
        INSERT INTO nominations (
          nominee_name, nominee_grade_or_grad_year, nominator_name,
          nominator_relationship, nominator_email, milestone_type,
          description, nominee_contact_info, status, submission_duration_ms
        ) VALUES (
          ${data.nominee_name}, ${data.nominee_grade_or_grad_year}, ${data.nominator_name},
          ${data.nominator_relationship}, ${data.nominator_email}, ${data.milestone_type},
          ${data.description}, ${data.nominee_contact_info || null}, 'pending', ${durationMs}
        )
      `;
      revalidatePath("/admin/nominations");
      revalidatePath("/admin");
    }
    await recordNominationAttempt(ip);
    await sendNominationEmails({
      ...data,
      nominator_relationship: RELATIONSHIP_LABELS[data.nominator_relationship],
      milestone_label: MILESTONE_LABELS[data.milestone_type],
    });
    return {
      status: "success",
      message:
        "Thank you. Our team reviews every nomination by hand, and we'll confirm consent before anything is published.",
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Submission failed. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// Public: mentor connection request
// ---------------------------------------------------------------------------

export async function submitMentorConnect(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    return { status: "error", message: GENERIC_REJECTION };
  }

  const parsed = mentorConnectSchema.safeParse({
    comet_id: String(formData.get("comet_id") ?? ""),
    sender_name: String(formData.get("sender_name") ?? ""),
    sender_email: String(formData.get("sender_email") ?? ""),
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const data = parsed.data;

  // Resolve the name server-side and confirm the Comet is actually published
  // and opted in — the client never gets to name an arbitrary recipient.
  const { rows } = await safeSql<{ name: string }>`
    SELECT name FROM comet_profiles
    WHERE id = ${data.comet_id} AND published_at IS NOT NULL AND mentor_opt_in = TRUE
    LIMIT 1
  `;
  const comet = rows[0];
  if (!comet) {
    return { status: "error", message: "That Comet isn't available for mentoring right now." };
  }

  try {
    await sendMentorConnectEmail({
      comet_name: comet.name,
      sender_name: data.sender_name,
      sender_email: data.sender_email,
      message: data.message,
    });
    return {
      status: "success",
      message: "Your message is with the Zenith team. We'll pass it along and follow up by email.",
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Could not send your message. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// Admin: moderation
// ---------------------------------------------------------------------------

/**
 * Approving a nomination creates a *draft* Comet profile. It is deliberately
 * unpublished: staff still add the photo, tags, and consent record before it
 * can go live.
 */
export async function approveNomination(id: number): Promise<void> {
  await assertAdmin();
  if (!isDbConfigured()) return;

  const { rows } = await safeSql<{
    id: number;
    nominee_name: string;
    milestone_type: string;
    description: string;
    status: string;
  }>`
    SELECT id, nominee_name, milestone_type, description, status
    FROM nominations WHERE id = ${id} LIMIT 1
  `;
  const nomination = rows[0];
  if (!nomination || nomination.status !== "pending") return;

  await safeSql`
    INSERT INTO comet_profiles (
      status, name, milestone_type, headline, full_story, source_nomination_id
    ) VALUES (
      'in_motion', ${nomination.nominee_name}, ${nomination.milestone_type},
      ${nomination.description.slice(0, 240)}, ${nomination.description}, ${nomination.id}
    )
  `;
  await safeSql`
    UPDATE nominations
    SET status = 'approved', reviewed_at = NOW(), reviewed_by = 'admin'
    WHERE id = ${id}
  `;
  revalidatePath("/admin/nominations");
  revalidatePath("/admin/comets");
  revalidatePath("/admin");
}

export async function rejectNomination(id: number, reason: string): Promise<ActionState> {
  await assertAdmin();
  const notes = reason.trim();
  if (notes.length < 3) {
    return { status: "error", message: "Please give a short reason for rejecting this nomination." };
  }
  if (isDbConfigured()) {
    await safeSql`
      UPDATE nominations
      SET status = 'rejected', reviewed_at = NOW(), reviewed_by = 'admin', review_notes = ${notes}
      WHERE id = ${id} AND status = 'pending'
    `;
  }
  revalidatePath("/admin/nominations");
  revalidatePath("/admin");
  return { status: "success", message: "Nomination rejected." };
}

export async function deleteNomination(id: number): Promise<void> {
  await assertAdmin();
  if (isDbConfigured()) {
    await safeSql`DELETE FROM nominations WHERE id = ${id}`;
  }
  revalidatePath("/admin/nominations");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Admin: Comet profiles
// ---------------------------------------------------------------------------

function parseCometFormData(formData: FormData) {
  return {
    status: String(formData.get("status") ?? "in_motion") as CometStatus,
    name: String(formData.get("name") ?? ""),
    photo_url: String(formData.get("photo_url") ?? ""),
    grad_year: String(formData.get("grad_year") ?? ""),
    current_grade: String(formData.get("current_grade") ?? ""),
    milestone_type: String(formData.get("milestone_type") ?? "general_story") as MilestoneType,
    headline: String(formData.get("headline") ?? ""),
    full_story: String(formData.get("full_story") ?? ""),
    certifications: parseList(String(formData.get("certifications") ?? "")),
    field_or_institution: String(formData.get("field_or_institution") ?? ""),
    current_role_or_program: String(formData.get("current_role_or_program") ?? ""),
    mentor_opt_in: formData.get("mentor_opt_in") === "on",
    tags: parseList(String(formData.get("tags") ?? "")),
    consent_on_file: formData.get("consent_on_file") === "on",
    consent_recorded_by: String(formData.get("consent_recorded_by") ?? ""),
    featured_quarter: String(formData.get("featured_quarter") ?? ""),
  };
}

export async function saveCometProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return { status: "error", message: "Missing profile id." };

  const parsed = cometProfileSchema.safeParse(parseCometFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;

  if (!isDbConfigured()) {
    return { status: "error", message: "Database is not configured." };
  }

  try {
    // Positional params here (not the template tag) because certifications and
    // tags are TEXT[] — the same convention the community form uses.
    await safeQuery(
      `UPDATE comet_profiles SET
         status = $1, name = $2, photo_url = $3, grad_year = $4, current_grade = $5,
         milestone_type = $6, headline = $7, full_story = $8, certifications = $9,
         field_or_institution = $10, current_role_or_program = $11, mentor_opt_in = $12,
         mentor_contact_method = $13, tags = $14, consent_on_file = $15,
         consent_recorded_by = $16, featured_quarter = $17, updated_at = NOW()
       WHERE id = $18`,
      [
        d.status,
        d.name,
        d.photo_url || null,
        d.grad_year,
        d.current_grade,
        d.milestone_type,
        d.headline,
        d.full_story || "",
        d.certifications,
        d.field_or_institution || null,
        d.current_role_or_program || null,
        d.mentor_opt_in,
        d.mentor_opt_in ? "form" : "none",
        d.tags,
        d.consent_on_file,
        d.consent_recorded_by || null,
        d.featured_quarter || null,
        id,
      ],
    );
    // Withdrawing consent must immediately unpublish the profile.
    if (!d.consent_on_file) {
      await safeSql`UPDATE comet_profiles SET published_at = NULL WHERE id = ${id}`;
    }
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Could not save profile.",
    };
  }

  revalidatePath("/admin/comets");
  revalidatePath("/alumni");
  return { status: "success", message: "Profile saved." };
}

/**
 * Hard consent gate. Publishing is refused at the database level unless
 * consent_on_file is true — this is not merely a checkbox in the UI, because
 * these profiles include minors.
 */
export async function publishComet(id: number): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) {
    return { status: "error", message: "Database is not configured." };
  }

  const { rows } = await safeSql<{ consent_on_file: boolean; headline: string }>`
    SELECT consent_on_file, headline FROM comet_profiles WHERE id = ${id} LIMIT 1
  `;
  const profile = rows[0];
  if (!profile) return { status: "error", message: "Profile not found." };

  if (!profile.consent_on_file) {
    return {
      status: "error",
      message:
        "Consent is not on file. A signed release is required before publishing — for students under 18 that means parent or guardian sign-off.",
    };
  }
  if (!profile.headline?.trim()) {
    return { status: "error", message: "Add a headline before publishing." };
  }

  await safeSql`
    UPDATE comet_profiles SET published_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND consent_on_file = TRUE
  `;
  revalidatePath("/admin/comets");
  revalidatePath("/alumni");
  return { status: "success", message: "Profile published." };
}

export async function unpublishComet(id: number): Promise<void> {
  await assertAdmin();
  if (isDbConfigured()) {
    await safeSql`UPDATE comet_profiles SET published_at = NULL, updated_at = NOW() WHERE id = ${id}`;
  }
  revalidatePath("/admin/comets");
  revalidatePath("/alumni");
}

export async function deleteCometProfile(id: number): Promise<void> {
  await assertAdmin();
  if (isDbConfigured()) {
    await safeSql`DELETE FROM comet_profiles WHERE id = ${id}`;
  }
  revalidatePath("/admin/comets");
  revalidatePath("/alumni");
}
