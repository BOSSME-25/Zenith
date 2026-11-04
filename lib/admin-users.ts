import "server-only";
import { randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { safeQuery } from "@/lib/db";
import { type Role, isRole } from "@/lib/admin-access";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export const MIN_PASSWORD_LENGTH = 10;
const KEY_LENGTH = 32;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/* ------------------------------------------------------------------ */
/* Passwords                                                           */
/* ------------------------------------------------------------------ */

/** scrypt with a random salt per password, stored as scrypt$salt$hash. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPasswordHash(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | null = null;
/** Checked when the email is unknown, so a wrong email takes as long as a wrong password. */
async function burnTime(password: string) {
  dummyHash ??= hashPassword("not-a-real-account");
  await verifyPasswordHash(password, await dummyHash);
}

// No 0, O, 1, I or l: a temporary password is read aloud or typed from a note.
const TEMP_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Three groups of four, for example Kp7m-Wn3x-Rd9h. Shown once, then replaced at first sign-in. */
export function generateTempPassword(): string {
  const group = () =>
    Array.from({ length: 4 }, () => TEMP_ALPHABET[randomInt(TEMP_ALPHABET.length)]).join("");
  return `${group()}-${group()}-${group()}`;
}

export function passwordProblem(password: string, email?: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters. A few words together works well.`;
  }
  if (email && password.toLowerCase() === email.toLowerCase()) {
    return "The password cannot be your email address.";
  }
  if (/^(.)\1+$/.test(password)) return "Choose something less repetitive.";
  return null;
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  title: string | null;
  role: Role;
  must_change_password: boolean;
  active: boolean;
  session_version: number;
  failed_attempts: number;
  locked_until: Date | null;
  last_login_at: Date | null;
  created_at: Date;
  created_by: string | null;
  password_changed_at: Date | null;
};

type AdminUserRow = Omit<AdminUser, "role"> & { role: string };
type WithHash = AdminUserRow & { password_hash: string };

const COLUMNS = `id, email, name, title, role, must_change_password, active, session_version,
  failed_attempts, locked_until, last_login_at, created_at, created_by, password_changed_at`;

function toUser(row: AdminUserRow): AdminUser | null {
  // A role the code no longer knows gets no access rather than a guess.
  return isRole(row.role) ? ({ ...row, role: row.role } as AdminUser) : null;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { rows } = await safeQuery<AdminUserRow>(
    `SELECT ${COLUMNS} FROM admin_users ORDER BY active DESC, name ASC`,
  );
  return rows.map(toUser).filter((u): u is AdminUser => u !== null);
}

export async function getUserById(id: number): Promise<AdminUser | null> {
  if (!Number.isInteger(id)) return null;
  const { rows } = await safeQuery<AdminUserRow>(
    `SELECT ${COLUMNS} FROM admin_users WHERE id = $1`,
    [id],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

export async function createAdminUser(input: {
  email: string;
  name: string;
  title: string;
  role: Role;
  createdBy: string;
}): Promise<{ user: AdminUser; tempPassword: string } | { error: string }> {
  const email = normalizeEmail(input.email);
  const { rows: existing } = await safeQuery(`SELECT 1 FROM admin_users WHERE email = $1`, [email]);
  if (existing.length > 0) return { error: "Someone already has a login with that email." };
  const tempPassword = generateTempPassword();
  const { rows } = await safeQuery<AdminUserRow>(
    `INSERT INTO admin_users (email, name, title, role, password_hash, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [email, input.name.trim(), input.title.trim() || null, input.role, await hashPassword(tempPassword), input.createdBy],
  );
  const user = toUser(rows[0]);
  if (!user) return { error: "Could not create the login." };
  return { user, tempPassword };
}

/** New temporary password; signs the person out everywhere and makes them choose their own. */
export async function resetPassword(id: number): Promise<string | null> {
  const tempPassword = generateTempPassword();
  const { rowCount } = await safeQuery(
    `UPDATE admin_users
     SET password_hash = $2, must_change_password = TRUE, session_version = session_version + 1,
         failed_attempts = 0, locked_until = NULL
     WHERE id = $1`,
    [id, await hashPassword(tempPassword)],
  );
  return rowCount ? tempPassword : null;
}

export async function setActive(id: number, active: boolean): Promise<boolean> {
  const { rowCount } = await safeQuery(
    `UPDATE admin_users
     SET active = $2, session_version = session_version + 1, failed_attempts = 0, locked_until = NULL
     WHERE id = $1`,
    [id, active],
  );
  return Boolean(rowCount);
}

export async function setRole(id: number, role: Role): Promise<boolean> {
  const { rowCount } = await safeQuery(
    `UPDATE admin_users SET role = $2, session_version = session_version + 1 WHERE id = $1`,
    [id, role],
  );
  return Boolean(rowCount);
}

export async function unlock(id: number): Promise<boolean> {
  const { rowCount } = await safeQuery(
    `UPDATE admin_users SET failed_attempts = 0, locked_until = NULL WHERE id = $1`,
    [id],
  );
  return Boolean(rowCount);
}

/** Verifies the current password, then stores the new one. Returns the new session version. */
export async function changeOwnPassword(
  id: number,
  current: string,
  next: string,
): Promise<{ ok: true; sessionVersion: number } | { ok: false; message: string }> {
  const { rows } = await safeQuery<WithHash>(
    `SELECT ${COLUMNS}, password_hash FROM admin_users WHERE id = $1 AND active = TRUE`,
    [id],
  );
  const row = rows[0];
  if (!row || !(await verifyPasswordHash(current, row.password_hash))) {
    return { ok: false, message: "That is not your current password." };
  }
  const problem = passwordProblem(next, row.email);
  if (problem) return { ok: false, message: problem };
  if (await verifyPasswordHash(next, row.password_hash)) {
    return { ok: false, message: "Choose a different password from the current one." };
  }
  const { rows: updated } = await safeQuery<{ session_version: number }>(
    `UPDATE admin_users
     SET password_hash = $2, must_change_password = FALSE, password_changed_at = NOW(),
         session_version = session_version + 1
     WHERE id = $1
     RETURNING session_version`,
    [id, await hashPassword(next)],
  );
  return { ok: true, sessionVersion: updated[0].session_version };
}

export type AuthResult =
  | { ok: true; user: AdminUser }
  | { ok: false; reason: "invalid" | "locked" };

/**
 * Checks an email and password. Wrong email and wrong password look the same
 * to the caller, and five wrong passwords lock the account for fifteen minutes.
 */
export async function authenticate(emailInput: string, password: string): Promise<AuthResult> {
  const email = normalizeEmail(emailInput);
  const { rows } = await safeQuery<WithHash>(
    `SELECT ${COLUMNS}, password_hash FROM admin_users WHERE email = $1`,
    [email],
  );
  const row = rows[0];
  if (!row || !row.active) {
    await burnTime(password);
    return { ok: false, reason: "invalid" };
  }
  if (row.locked_until && row.locked_until.getTime() > Date.now()) {
    return { ok: false, reason: "locked" };
  }
  if (!(await verifyPasswordHash(password, row.password_hash))) {
    const failures = row.failed_attempts + 1;
    const lock = failures >= MAX_FAILED_ATTEMPTS;
    await safeQuery(
      `UPDATE admin_users
       SET failed_attempts = $2,
           locked_until = CASE WHEN $3 THEN NOW() + ($4 * INTERVAL '1 minute') ELSE locked_until END
       WHERE id = $1`,
      [row.id, lock ? 0 : failures, lock, LOCK_MINUTES],
    );
    return { ok: false, reason: lock ? "locked" : "invalid" };
  }
  await safeQuery(
    `UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1`,
    [row.id],
  );
  const user = toUser(row);
  return user ? { ok: true, user } : { ok: false, reason: "invalid" };
}
