export const ADMIN_COOKIE_NAME = "zenith_admin";
const ONE_DAY = 60 * 60 * 24;
export const ADMIN_COOKIE_MAX_AGE = ONE_DAY * 7;

/**
 * The key that signs sign-in cookies. In production there is no fallback: with
 * neither AUTH_SECRET nor ADMIN_PASSWORD set, nothing verifies and nothing can
 * be issued, rather than signing with a key anyone could read in the source.
 */
function getSecret(): string | null {
  const configured = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return null;
  return "zenith-development-secret-do-not-use-in-production";
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getKey(): Promise<CryptoKey | null> {
  const secret = getSecret();
  if (!secret) return null;
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bytesToHex(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < arr.length; i++) {
    out += arr[i].toString(16).padStart(2, "0");
  }
  return out;
}

function toBase64Url(text: string): string {
  const bytes = encoder.encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return decoder.decode(bytes);
  } catch {
    return null;
  }
}

export async function sign(value: string): Promise<string | null> {
  const key = await getKey();
  if (!key) return null;
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToHex(sig);
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * What a sign-in cookie says. `sub` is "owner" for the developer login or
 * "u<id>" for a person. `sv` is that person's session version: changing a
 * password, role or status bumps it, which signs their old cookies out. `pv`
 * does the same for the developer login when ADMIN_PASSWORD changes.
 */
export type SessionPayload = {
  sub: string;
  sv: number;
  pv?: string;
  iat: number;
};

export async function buildSessionToken(data: Omit<SessionPayload, "iat">): Promise<string> {
  const body = toBase64Url(JSON.stringify({ ...data, iat: Date.now() }));
  const sig = await sign(`v2.${body}`);
  if (!sig) throw new Error("No signing secret is configured (set AUTH_SECRET or ADMIN_PASSWORD).");
  return `v2.${body}.${sig}`;
}

/** Checks the signature and age only. The database is checked separately. */
export async function readSessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v2") return null;
  const expected = await sign(`v2.${parts[1]}`);
  if (!expected || !constantTimeEqualHex(expected, parts[2])) return null;
  const json = fromBase64Url(parts[1]);
  if (!json) return null;
  try {
    const data = JSON.parse(json) as SessionPayload;
    if (typeof data.sub !== "string" || typeof data.sv !== "number" || typeof data.iat !== "number") {
      return null;
    }
    if (Date.now() - data.iat >= ADMIN_COOKIE_MAX_AGE * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export async function verifyTokenValue(token: string | undefined): Promise<boolean> {
  return (await readSessionToken(token)) !== null;
}

/** Ties a developer session to the current ADMIN_PASSWORD. */
export async function ownerFingerprint(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return ((await sign(`owner-password:${password}`)) ?? "").slice(0, 16);
}
