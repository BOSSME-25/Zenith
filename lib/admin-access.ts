/**
 * Who can open which part of the admin. Pure data and helpers with no server
 * dependencies, so the sidebar, the pages and the actions all read one list.
 *
 * To change what a role can do, edit ROLE_SECTIONS below. Nothing else needs to
 * change: the sidebar, every page and every action check this list.
 */

export const SECTIONS = [
  "dashboard",
  "families",
  "community",
  "partners",
  "surveys",
  "contacts",
  "newsletter",
  "subscribers",
  "updates",
  "nominations",
  "comets",
  "feedback",
  "meetings",
  "settings",
  "users",
] as const;
export type Section = (typeof SECTIONS)[number];

/** The two kinds of person with their own login. The developer login is separate. */
export const ROLES = ["school", "board"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  school: "School",
  board: "Board",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  school: "Everything in the admin except managing logins.",
  board: "Meetings, site settings, and feedback.",
};

const ALL_BUT_USERS = SECTIONS.filter((s) => s !== "users");

export const ROLE_SECTIONS: Record<Role, readonly Section[]> = {
  school: ALL_BUT_USERS,
  board: ["meetings", "settings", "feedback"],
};

/** Sections that need the developer login, whatever a role says. */
export const OWNER_ONLY: readonly Section[] = ["users"];

export type Access = { kind: "owner" } | { kind: "user"; role: Role };

export function canAccess(who: Access, section: Section): boolean {
  if (who.kind === "owner") return true;
  if (OWNER_ONLY.includes(section)) return false;
  return ROLE_SECTIONS[who.role].includes(section);
}

export function sectionsFor(who: Access): Section[] {
  return SECTIONS.filter((s) => canAccess(who, s));
}

/** The page to send someone to when they cannot open the one they asked for. */
export function landingFor(who: Access): string {
  if (canAccess(who, "dashboard")) return "/admin";
  if (canAccess(who, "meetings")) return "/admin/meetings";
  return "/admin/account";
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
