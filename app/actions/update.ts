"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeSql, isDbConfigured } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import {
  type ActionState,
  updateSchema,
  fieldErrorsFromZod,
  slugify,
} from "@/lib/validators";

async function assertAdmin() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}

function parseUpdateFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || slugify(String(formData.get("title") ?? "")),
    body: String(formData.get("body") ?? ""),
    published: formData.get("published") === "on" || formData.get("published") === "true",
    publish_date: String(formData.get("publish_date") ?? ""),
  };
}

export async function createUpdate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const parsed = updateSchema.safeParse(parseUpdateFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const data = parsed.data;
  if (!isDbConfigured()) {
    return {
      status: "error",
      message: "Database is not configured. Set POSTGRES_URL and run /api/init to enable updates.",
    };
  }
  try {
    if (data.publish_date) {
      await safeSql`
        INSERT INTO updates (title, slug, body, published, publish_date)
        VALUES (${data.title}, ${data.slug}, ${data.body}, ${data.published}, ${data.publish_date})
      `;
    } else {
      await safeSql`
        INSERT INTO updates (title, slug, body, published)
        VALUES (${data.title}, ${data.slug}, ${data.body}, ${data.published})
      `;
    }
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Could not save update.",
    };
  }
  revalidatePath("/updates");
  revalidatePath(`/updates/${data.slug}`);
  revalidatePath("/admin/updates");
  redirect("/admin/updates");
}

export async function editUpdate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) {
    return { status: "error", message: "Missing update id." };
  }
  const parsed = updateSchema.safeParse(parseUpdateFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const data = parsed.data;
  if (!isDbConfigured()) {
    return {
      status: "error",
      message: "Database is not configured. Set POSTGRES_URL and run /api/init to enable updates.",
    };
  }
  try {
    if (data.publish_date) {
      await safeSql`
        UPDATE updates
        SET title = ${data.title},
            slug = ${data.slug},
            body = ${data.body},
            published = ${data.published},
            publish_date = ${data.publish_date},
            updated_at = NOW()
        WHERE id = ${id}
      `;
    } else {
      await safeSql`
        UPDATE updates
        SET title = ${data.title},
            slug = ${data.slug},
            body = ${data.body},
            published = ${data.published},
            updated_at = NOW()
        WHERE id = ${id}
      `;
    }
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Could not save update.",
    };
  }
  revalidatePath("/updates");
  revalidatePath(`/updates/${data.slug}`);
  revalidatePath("/admin/updates");
  redirect("/admin/updates");
}

export async function deleteUpdate(id: number): Promise<void> {
  await assertAdmin();
  if (isDbConfigured()) {
    await safeSql`DELETE FROM updates WHERE id = ${id}`;
  }
  revalidatePath("/updates");
  revalidatePath("/admin/updates");
}

export async function deleteSubmission(
  table: "families" | "community" | "partners" | "surveys" | "contacts" | "newsletter",
  id: number,
): Promise<void> {
  await assertAdmin();
  if (!isDbConfigured()) return;
  const map = {
    families: () => safeSql`DELETE FROM families WHERE id = ${id}`,
    community: () => safeSql`DELETE FROM community WHERE id = ${id}`,
    partners: () => safeSql`DELETE FROM partners WHERE id = ${id}`,
    surveys: () => safeSql`DELETE FROM surveys WHERE id = ${id}`,
    contacts: () => safeSql`DELETE FROM contacts WHERE id = ${id}`,
    newsletter: () => safeSql`DELETE FROM newsletter_subscribers WHERE id = ${id}`,
  } as const;
  await map[table]();
  // Subscribers use the "newsletter" table key but live at /admin/subscribers.
  revalidatePath(table === "newsletter" ? "/admin/subscribers" : `/admin/${table}`);
  revalidatePath("/admin");
}
