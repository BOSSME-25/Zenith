"use server";

import { revalidatePath } from "next/cache";
import { safeQuery, isDbConfigured } from "@/lib/db";
import { sendSurveyEmails } from "@/lib/email";
import {
  type ActionState,
  CAREER_PATHWAYS,
  surveySchema,
  fieldErrorsFromZod,
} from "@/lib/validators";

export async function submitSurveyForm(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pathways = formData
    .getAll("career_pathways")
    .map((v) => String(v))
    .filter((v): v is (typeof CAREER_PATHWAYS)[number] =>
      (CAREER_PATHWAYS as readonly string[]).includes(v),
    );

  const raw = {
    is_resident: (formData.get("is_resident") || "") as string,
    has_child: (formData.get("has_child") || "") as string,
    career_pathways: pathways,
    important_to_family: String(formData.get("important_to_family") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = surveySchema.safeParse({
    ...raw,
    is_resident: raw.is_resident === "yes" || raw.is_resident === "no" ? raw.is_resident : undefined,
    has_child: raw.has_child === "yes" || raw.has_child === "no" ? raw.has_child : undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the survey and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const data = parsed.data;
  const isResident = data.is_resident == null ? null : data.is_resident === "yes";
  const hasChild = data.has_child == null ? null : data.has_child === "yes";

  try {
    if (isDbConfigured()) {
      await safeQuery(
        `INSERT INTO surveys (is_resident, has_child, career_pathways, important_to_family, name, email)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          isResident,
          hasChild,
          data.career_pathways,
          data.important_to_family || null,
          data.name || null,
          data.email || null,
        ],
      );
      revalidatePath("/admin/surveys");
      revalidatePath("/admin");
    }
    await sendSurveyEmails({
      is_resident: isResident,
      has_child: hasChild,
      career_pathways: data.career_pathways,
      important_to_family: data.important_to_family || null,
      name: data.name || null,
      email: data.email || null,
    });
    return {
      status: "success",
      message: "Thank you for sharing your input. Every voice strengthens Zenith.",
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Submission failed. Please try again.",
    };
  }
}
