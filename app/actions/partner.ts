"use server";

import { revalidatePath } from "next/cache";
import { safeQuery, isDbConfigured } from "@/lib/db";
import { sendPartnerEmails } from "@/lib/email";
import {
  type ActionState,
  PARTNER_INTERESTS,
  partnerSchema,
  fieldErrorsFromZod,
} from "@/lib/validators";

export async function submitPartnerForm(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const interests = formData
    .getAll("interests")
    .map((v) => String(v))
    .filter((v): v is (typeof PARTNER_INTERESTS)[number] =>
      (PARTNER_INTERESTS as readonly string[]).includes(v),
    );

  const raw = {
    organization: String(formData.get("organization") ?? ""),
    contact_name: String(formData.get("contact_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    interests,
    description: String(formData.get("description") ?? ""),
  };

  const parsed = partnerSchema.safeParse(raw);
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
      await safeQuery(
        `INSERT INTO partners (organization, contact_name, email, phone, interests, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.organization,
          data.contact_name,
          data.email,
          data.phone || null,
          data.interests,
          data.description,
        ],
      );
      revalidatePath("/admin/partners");
      revalidatePath("/admin");
    }
    await sendPartnerEmails({
      organization: data.organization,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone || null,
      interests: data.interests,
      description: data.description,
    });
    return {
      status: "success",
      message:
        "Thank you for reaching out. We'll follow up to explore how we might partner as Zenith progresses through charter authorization.",
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Submission failed. Please try again.",
    };
  }
}
