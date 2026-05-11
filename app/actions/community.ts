"use server";

import { revalidatePath } from "next/cache";
import { safeQuery, isDbConfigured } from "@/lib/db";
import { sendCommunityEmails } from "@/lib/email";
import {
  type ActionState,
  COMMUNITY_INTERESTS,
  COMMUNITY_ROLES,
  communitySchema,
  fieldErrorsFromZod,
} from "@/lib/validators";

export async function submitCommunityForm(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const roles = formData
    .getAll("roles")
    .map((v) => String(v))
    .filter((v): v is (typeof COMMUNITY_ROLES)[number] =>
      (COMMUNITY_ROLES as readonly string[]).includes(v),
    );
  const interests = formData
    .getAll("interests")
    .map((v) => String(v))
    .filter((v): v is (typeof COMMUNITY_INTERESTS)[number] =>
      (COMMUNITY_INTERESTS as readonly string[]).includes(v),
    );

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    zip_code: String(formData.get("zip_code") ?? ""),
    roles,
    other_role: String(formData.get("other_role") ?? ""),
    interests,
  };

  const parsed = communitySchema.safeParse(raw);
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
        `INSERT INTO community (name, email, zip_code, roles, other_role, interests)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.name,
          data.email,
          data.zip_code,
          data.roles,
          data.other_role || null,
          data.interests,
        ],
      );
      revalidatePath("/admin/community");
      revalidatePath("/admin");
    }
    await sendCommunityEmails({
      name: data.name,
      email: data.email,
      zip_code: data.zip_code,
      roles: data.roles,
      other_role: data.other_role || null,
      interests: data.interests,
    });
    return {
      status: "success",
      message: "Thank you for joining the Zenith community of supporters.",
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Submission failed. Please try again.",
    };
  }
}
