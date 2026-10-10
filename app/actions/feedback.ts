"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  safeSql,
  isDbConfigured,
  submissionsUnavailable,
  SUBMISSIONS_UNAVAILABLE_MESSAGE,
} from "@/lib/db";
import { guardSubmission } from "@/lib/bot-guard";
import { isAuthenticated } from "@/lib/auth";
import { sendFeedbackEmail } from "@/lib/email";
import {
  type ActionState,
  FEEDBACK_ROLE_LABELS,
  FEEDBACK_TOPIC_LABELS,
  feedbackSchema,
  fieldErrorsFromZod,
} from "@/lib/validators";

async function assertAdmin() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}

/**
 * Public: reachable from the admin sign-in page, so there is no session to
 * lean on. The honeypot, time trap, Turnstile and a per-connection limit stand
 * in for one. The limit is generous because staff in one building share one
 * network, and a staff meeting is exactly when several would submit at once.
 */
export async function submitFeedback(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = await guardSubmission(formData, {
    scope: "feedback",
    limit: 30,
    // Lower than the other forms: a pasted message and two dropdowns is quick.
    minMs: 2000,
  });
  if (!guard.ok) return { status: "error", message: guard.message };

  const parsed = feedbackSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    page: String(formData.get("page") ?? ""),
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

  if (submissionsUnavailable()) {
    return { status: "error", message: SUBMISSIONS_UNAVAILABLE_MESSAGE };
  }

  try {
    if (isDbConfigured()) {
      await safeSql`
        INSERT INTO feedback (name, email, role, topic, page, message)
        VALUES (${data.name}, ${data.email || null}, ${data.role}, ${data.topic},
                ${data.page || null}, ${data.message})
      `;
      revalidatePath("/admin/feedback");
    }
  } catch (err) {
    // Not the raw database error: this form is open to anyone who finds the
    // sign-in page, and the most likely cause is a table that has not been
    // created yet (/api/init), which a reader cannot act on.
    console.error(
      "[zenith][feedback] Could not save feedback — has /api/init been run on this deployment?",
      err instanceof Error ? err.message : err,
    );
    return {
      status: "error",
      message:
        "We couldn't save your feedback just now. Please try again in a little while. If it keeps happening, report a problem by emailing ZenithTech@bossmenow.com.",
    };
  }

  await sendFeedbackEmail({
    name: data.name,
    email: data.email,
    role: FEEDBACK_ROLE_LABELS[data.role],
    topic: FEEDBACK_TOPIC_LABELS[data.topic],
    page: data.page,
    message: data.message,
  });

  return {
    status: "success",
    message: "Thank you. Your feedback is with the team.",
  };
}

export async function setFeedbackStatus(id: number, status: "new" | "done"): Promise<void> {
  await assertAdmin();
  if (!Number.isFinite(id) || (status !== "new" && status !== "done")) return;
  if (isDbConfigured()) {
    await safeSql`
      UPDATE feedback
      SET status = ${status}, resolved_at = ${status === "done" ? new Date().toISOString() : null}
      WHERE id = ${id}
    `;
  }
  revalidatePath("/admin/feedback");
}

export async function deleteFeedback(id: number): Promise<void> {
  await assertAdmin();
  if (!Number.isFinite(id)) return;
  if (isDbConfigured()) {
    await safeSql`DELETE FROM feedback WHERE id = ${id}`;
  }
  revalidatePath("/admin/feedback");
}
