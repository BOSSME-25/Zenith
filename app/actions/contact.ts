"use server";

import { revalidatePath } from "next/cache";
import { safeSql, isDbConfigured } from "@/lib/db";
import { sendContactEmails } from "@/lib/email";
import {
  type ActionState,
  contactSchema,
  fieldErrorsFromZod,
} from "@/lib/validators";

export async function submitContactForm(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactSchema.safeParse(raw);
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
        INSERT INTO contacts (name, email, subject, message)
        VALUES (${data.name}, ${data.email}, ${data.subject}, ${data.message})
      `;
      revalidatePath("/admin/contacts");
      revalidatePath("/admin");
    }
    await sendContactEmails(data);
    return {
      status: "success",
      message: "Thanks for reaching out. A member of our team will respond soon.",
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Submission failed. Please try again.",
    };
  }
}
