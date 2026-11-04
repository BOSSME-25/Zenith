"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isDbConfigured } from "@/lib/db";
import { requireSection, requireSession, signInUser } from "@/lib/auth";
import { ROLES, isRole } from "@/lib/admin-access";
import {
  changeOwnPassword,
  createAdminUser,
  getUserById,
  passwordProblem,
  resetPassword,
  setActive,
  setRole,
  unlock,
} from "@/lib/admin-users";
import { type ActionState, fieldErrorsFromZod } from "@/lib/validators";
import { writeAudit } from "@/lib/meetings";

/** A result that may carry a temporary password, which is shown once and never stored. */
export type UserActionState = ActionState | { status: "success"; message: string; tempPassword: string };

const NO_DB: ActionState = {
  status: "error",
  message: "The database is not configured, so logins cannot be managed.",
};

const createSchema = z.object({
  name: z.string().trim().min(2, "Enter the person's name.").max(80),
  title: z.string().trim().max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(160),
  role: z.enum(ROLES, { message: "Choose School or Board." }),
});

/** Managing logins is the developer's job alone. */
async function requireOwner() {
  const session = await requireSection("users");
  return session.actor;
}

function refresh() {
  revalidatePath("/admin/users");
}

export async function createUser(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireOwner();
  if (!isDbConfigured()) return NO_DB;
  const parsed = createSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    title: String(formData.get("title") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? ""),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const result = await createAdminUser({ ...parsed.data, createdBy: actor });
  if ("error" in result) {
    return { status: "error", message: result.error, fieldErrors: { email: result.error } };
  }
  await writeAudit(null, "admin_user_created", actor, {
    email: result.user.email,
    role: result.user.role,
  });
  refresh();
  return {
    status: "success",
    message: `Login created for ${result.user.name}.`,
    tempPassword: result.tempPassword,
  };
}

const idFrom = (formData: FormData) => Number(formData.get("id"));

export async function resetUserPassword(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await requireOwner();
  if (!isDbConfigured()) return NO_DB;
  const user = await getUserById(idFrom(formData));
  if (!user) return { status: "error", message: "That login no longer exists." };
  const tempPassword = await resetPassword(user.id);
  if (!tempPassword) return { status: "error", message: "Could not reset that password." };
  await writeAudit(null, "admin_user_password_reset", actor, { email: user.email });
  refresh();
  return {
    status: "success",
    message: `New temporary password for ${user.name}. They are signed out everywhere.`,
    tempPassword,
  };
}

export async function setUserActive(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireOwner();
  if (!isDbConfigured()) return NO_DB;
  const user = await getUserById(idFrom(formData));
  if (!user) return { status: "error", message: "That login no longer exists." };
  const active = String(formData.get("active")) === "true";
  await setActive(user.id, active);
  await writeAudit(null, active ? "admin_user_reactivated" : "admin_user_deactivated", actor, {
    email: user.email,
  });
  refresh();
  return {
    status: "success",
    message: active ? `${user.name} can sign in again.` : `${user.name} is switched off and signed out.`,
  };
}

export async function setUserRole(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireOwner();
  if (!isDbConfigured()) return NO_DB;
  const user = await getUserById(idFrom(formData));
  const role = String(formData.get("role") ?? "");
  if (!user || !isRole(role)) return { status: "error", message: "Choose School or Board." };
  if (user.role === role) return { status: "success", message: "No change." };
  await setRole(user.id, role);
  await writeAudit(null, "admin_user_role_changed", actor, {
    email: user.email,
    from: user.role,
    to: role,
  });
  refresh();
  return {
    status: "success",
    message: `${user.name} is now ${role === "school" ? "School" : "Board"}. They are signed out and will sign in again.`,
  };
}

export async function unlockUser(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireOwner();
  if (!isDbConfigured()) return NO_DB;
  const user = await getUserById(idFrom(formData));
  if (!user) return { status: "error", message: "That login no longer exists." };
  await unlock(user.id);
  await writeAudit(null, "admin_user_unlocked", actor, { email: user.email });
  refresh();
  return { status: "success", message: `${user.name} can try again.` };
}

/** Everyone changes their own password. The developer login is changed in Vercel instead. */
export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession({ allowMustChange: true });
  if (session.kind !== "user") {
    return {
      status: "error",
      message: "The developer password is changed in the hosting settings (ADMIN_PASSWORD).",
    };
  }
  if (!isDbConfigured()) return NO_DB;
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!current) return { status: "error", message: "Enter your current password." };
  const problem = passwordProblem(next, session.email);
  if (problem) return { status: "error", message: problem, fieldErrors: { next: problem } };
  if (next !== confirm) {
    return { status: "error", message: "The two new passwords do not match.", fieldErrors: { confirm: "They do not match." } };
  }
  const result = await changeOwnPassword(session.id, current, next);
  if (!result.ok) return { status: "error", message: result.message, fieldErrors: { current: result.message } };
  // The old cookie just stopped working, so issue a fresh one for this browser.
  await signInUser(session.id, result.sessionVersion);
  await writeAudit(null, "admin_user_password_changed", session.actor, { email: session.email });
  return { status: "success", message: "Your password is changed." };
}
