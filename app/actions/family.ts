"use server";

import { revalidatePath } from "next/cache";
import {
  safeSql,
  isDbConfigured,
  submissionsUnavailable,
  SUBMISSIONS_UNAVAILABLE_MESSAGE,
} from "@/lib/db";
import { guardSubmission } from "@/lib/bot-guard";
import { sendFamilyEmails } from "@/lib/email";
import {
  type ActionState,
  familySchema,
  fieldErrorsFromZod,
} from "@/lib/validators";

export async function submitFamilyForm(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // The interest list is the one form Zenith cannot afford to lose a submission
  // from, so it deliberately gives up two protections that can turn a real
  // family away: Turnstile (which blocks anyone whose browser cannot load it,
  // and everyone during a Cloudflare outage) and a tight rate limit (a busy
  // tabling event can put dozens of signups behind one hotspot). The honeypot
  // and time trap still run. A little extra spam in this list costs far less
  // than a lost family.
  const guard = await guardSubmission(formData, {
    scope: "family",
    limit: 100,
    minMs: 3000,
    turnstile: false,
  });
  if (!guard.ok) return { status: "error", message: guard.message };

  const raw = {
    parent_name: String(formData.get("parent_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    student_name: String(formData.get("student_name") ?? ""),
    current_grade: String(formData.get("current_grade") ?? ""),
    expected_grade: String(formData.get("expected_grade") ?? ""),
    zip_code: String(formData.get("zip_code") ?? ""),
    preferred_contact: String(formData.get("preferred_contact") ?? ""),
    how_heard: String(formData.get("how_heard") ?? ""),
  };

  const parsed = familySchema.safeParse(raw);
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
        INSERT INTO families (parent_name, email, phone, student_name, current_grade, expected_grade, zip_code, preferred_contact, how_heard)
        VALUES (${data.parent_name}, ${data.email}, ${data.phone || null}, ${data.student_name}, ${data.current_grade}, ${data.expected_grade}, ${data.zip_code}, ${data.preferred_contact}, ${data.how_heard || null})
      `;
      revalidatePath("/admin/families");
      revalidatePath("/admin");
    }
    await sendFamilyEmails({
      parent_name: data.parent_name,
      email: data.email,
      phone: data.phone || null,
      student_name: data.student_name,
      current_grade: data.current_grade,
      expected_grade: data.expected_grade,
      zip_code: data.zip_code,
      preferred_contact: data.preferred_contact,
      how_heard: data.how_heard || null,
    });
    return {
      status: "success",
      message:
        "Thanks for joining the Zenith Interest List. We'll be in touch as our charter application progresses.",
    };
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error
          ? `We couldn't save your submission: ${err.message}`
          : "We couldn't save your submission. Please try again.",
    };
  }
}
