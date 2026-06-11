"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeSql, safeQuery, isDbConfigured } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import {
  type ActionState,
  type IssueEvent,
  newsletterIssueSchema,
  fieldErrorsFromZod,
} from "@/lib/validators";

const EVENT_SLOTS = 3;

async function assertAdmin() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}

function parseIssueFormData(formData: FormData) {
  const events: IssueEvent[] = [];
  for (let i = 0; i < EVENT_SLOTS; i++) {
    const title = String(formData.get(`events_${i}_title`) ?? "").trim();
    if (!title) continue; // empty slot
    events.push({
      month: String(formData.get(`events_${i}_month`) ?? "").trim(),
      day: String(formData.get(`events_${i}_day`) ?? "").trim(),
      title,
      detail: String(formData.get(`events_${i}_detail`) ?? "").trim(),
      url: String(formData.get(`events_${i}_url`) ?? "").trim(),
    });
  }
  return {
    issue_number: String(formData.get("issue_number") ?? ""),
    month_label: String(formData.get("month_label") ?? ""),
    published: formData.get("published") === "on" || formData.get("published") === "true",
    hero_image_url: String(formData.get("hero_image_url") ?? ""),
    hero_title: String(formData.get("hero_title") ?? ""),
    hero_text: String(formData.get("hero_text") ?? ""),
    hero_cta_label: String(formData.get("hero_cta_label") ?? ""),
    hero_cta_url: String(formData.get("hero_cta_url") ?? ""),
    founder_note: String(formData.get("founder_note") ?? ""),
    spotlight_image_url: String(formData.get("spotlight_image_url") ?? ""),
    spotlight_name: String(formData.get("spotlight_name") ?? ""),
    spotlight_text: String(formData.get("spotlight_text") ?? ""),
    events,
    classroom_title: String(formData.get("classroom_title") ?? ""),
    classroom_text: String(formData.get("classroom_text") ?? ""),
    stat_value: String(formData.get("stat_value") ?? ""),
    stat_text: String(formData.get("stat_text") ?? ""),
  };
}

function revalidateNewsletter() {
  revalidatePath("/newsletter");
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin");
}

export async function createIssue(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const parsed = newsletterIssueSchema.safeParse(parseIssueFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  if (!isDbConfigured()) {
    return { status: "error", message: "Database is not configured." };
  }
  const d = parsed.data;
  try {
    await safeQuery(
      `INSERT INTO newsletter_issues
        (issue_number, month_label, published, hero_image_url, hero_title, hero_text,
         hero_cta_label, hero_cta_url, founder_note, spotlight_image_url, spotlight_name,
         spotlight_text, events, classroom_title, classroom_text, stat_value, stat_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16,$17)`,
      [
        d.issue_number, d.month_label, d.published, d.hero_image_url, d.hero_title, d.hero_text,
        d.hero_cta_label, d.hero_cta_url, d.founder_note, d.spotlight_image_url, d.spotlight_name,
        d.spotlight_text, JSON.stringify(d.events), d.classroom_title, d.classroom_text,
        d.stat_value, d.stat_text,
      ],
    );
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Could not save the issue.",
    };
  }
  revalidateNewsletter();
  redirect("/admin/newsletter");
}

export async function editIssue(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) {
    return { status: "error", message: "Missing issue id." };
  }
  const parsed = newsletterIssueSchema.safeParse(parseIssueFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  if (!isDbConfigured()) {
    return { status: "error", message: "Database is not configured." };
  }
  const d = parsed.data;
  try {
    await safeQuery(
      `UPDATE newsletter_issues SET
        issue_number=$1, month_label=$2, published=$3, hero_image_url=$4, hero_title=$5,
        hero_text=$6, hero_cta_label=$7, hero_cta_url=$8, founder_note=$9,
        spotlight_image_url=$10, spotlight_name=$11, spotlight_text=$12, events=$13::jsonb,
        classroom_title=$14, classroom_text=$15, stat_value=$16, stat_text=$17,
        updated_at=NOW()
       WHERE id=$18`,
      [
        d.issue_number, d.month_label, d.published, d.hero_image_url, d.hero_title, d.hero_text,
        d.hero_cta_label, d.hero_cta_url, d.founder_note, d.spotlight_image_url, d.spotlight_name,
        d.spotlight_text, JSON.stringify(d.events), d.classroom_title, d.classroom_text,
        d.stat_value, d.stat_text, id,
      ],
    );
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Could not save the issue.",
    };
  }
  revalidateNewsletter();
  revalidatePath(`/newsletter/${id}`);
  redirect("/admin/newsletter");
}

export async function deleteIssue(id: number): Promise<void> {
  await assertAdmin();
  if (isDbConfigured()) {
    await safeSql`DELETE FROM newsletter_issues WHERE id = ${id}`;
  }
  revalidateNewsletter();
}
