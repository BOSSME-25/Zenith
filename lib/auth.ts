import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE,
  buildSessionToken,
  ownerFingerprint,
  readSessionToken,
} from "./auth-edge";
import { type Role, type Section, canAccess, landingFor } from "./admin-access";
import { getUserById } from "./admin-users";

export { ADMIN_COOKIE_NAME };

export function adminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 6);
}

export function verifyPassword(submitted: string): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || configured.length < 6) return false;
  if (configured.length !== submitted.length) return false;
  let diff = 0;
  for (let i = 0; i < configured.length; i++) {
    diff |= configured.charCodeAt(i) ^ submitted.charCodeAt(i);
  }
  return diff === 0;
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

/** The developer login (ADMIN_PASSWORD) and the four kinds of person with their own. */
export type Session =
  | { kind: "owner"; name: string; actor: string }
  | {
      kind: "user";
      id: number;
      name: string;
      title: string | null;
      email: string;
      role: Role;
      mustChangePassword: boolean;
      actor: string;
    };

export const actorLabel = (name: string, title: string | null) =>
  title ? `${name}, ${title}` : name;

async function setCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
}

export async function signInOwner(): Promise<void> {
  await setCookie(await buildSessionToken({ sub: "owner", sv: 0, pv: await ownerFingerprint() }));
}

export async function signInUser(id: number, sessionVersion: number): Promise<void> {
  await setCookie(await buildSessionToken({ sub: `u${id}`, sv: sessionVersion }));
}

export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Who is signed in, checked against the database every time. A cookie alone is
 * not enough: a person who was switched off, whose password was reset, or whose
 * role changed has a newer session version and their old cookie stops working.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const store = await cookies();
  const payload = await readSessionToken(store.get(ADMIN_COOKIE_NAME)?.value);
  if (!payload) return null;

  if (payload.sub === "owner") {
    if (!adminPasswordConfigured()) return null;
    // Changing ADMIN_PASSWORD signs every developer session out.
    if (payload.pv !== (await ownerFingerprint())) return null;
    return { kind: "owner", name: "Developer", actor: "Developer" };
  }

  const id = Number(payload.sub.replace(/^u/, ""));
  try {
    const user = await getUserById(id);
    if (!user || !user.active || user.session_version !== payload.sv) return null;
    return {
      kind: "user",
      id: user.id,
      name: user.name,
      title: user.title,
      email: user.email,
      role: user.role,
      mustChangePassword: user.must_change_password,
      actor: actorLabel(user.name, user.title),
    };
  } catch {
    return null;
  }
});

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

export const accessOf = (s: Session) =>
  s.kind === "owner" ? ({ kind: "owner" } as const) : ({ kind: "user", role: s.role } as const);

/**
 * Guards a page or action. Sends people to sign in, to choose a password if
 * they still have a temporary one, or to a page they may open.
 */
export async function requireSession(options: { allowMustChange?: boolean } = {}): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.kind === "user" && session.mustChangePassword && !options.allowMustChange) {
    redirect("/admin/account");
  }
  return session;
}

export async function requireSection(section: Section): Promise<Session> {
  const session = await requireSession();
  if (!canAccess(accessOf(session), section)) redirect(landingFor(accessOf(session)));
  return session;
}
