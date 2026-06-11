"use server";

import { revalidatePath } from "next/cache";
import { safeSql, isDbConfigured } from "@/lib/db";
import {
  type ActionState,
  newsletterSchema,
  fieldErrorsFromZod,
} from "@/lib/validators";

export async function subscribeNewsletter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
  };

  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const data = parsed.data;
  const name = data.name && data.name.length > 0 ? data.name : null;

  if (!isDbConfigured()) {
    return {
      status: "error",
      message: "We can't save your signup right now. Please try again later.",
    };
  }

  try {
    // ON CONFLICT keeps re-signups idempotent — the same email never errors.
    await safeSql`
      INSERT INTO newsletter_subscribers (email, name)
      VALUES (${data.email}, ${name})
      ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, newsletter_subscribers.name)
    `;
    revalidatePath("/admin/newsletter");
    revalidatePath("/admin");
    return {
      status: "success",
      message: "You're on the list! We'll email you when the first Zenith newsletter goes out.",
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Signup failed. Please try again.",
    };
  }
}
