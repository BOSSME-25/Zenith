"use server";

import { revalidatePath } from "next/cache";
import { safeSql, isDbConfigured } from "@/lib/db";
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
