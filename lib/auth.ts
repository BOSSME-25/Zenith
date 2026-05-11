import { cookies } from "next/headers";

const COOKIE_NAME = "zenith_admin";
const ONE_DAY = 60 * 60 * 24;
const COOKIE_MAX_AGE = ONE_DAY * 7;

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "zenith-development-secret-do-not-use-in-production"
  );
}

const encoder = new TextEncoder();

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
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

async function sign(value: string): Promise<string> {
  const key = await getKey();
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

async function buildToken(): Promise<string> {
  const issued = Date.now().toString();
  const sig = await sign(issued);
  return `${issued}.${sig}`;
}

export async function verifyTokenValue(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const issuedAt = Number(issued);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt >= COOKIE_MAX_AGE * 1000) return false;
  const expected = await sign(issued);
  return constantTimeEqualHex(expected, sig);
}

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

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyTokenValue(store.get(COOKIE_NAME)?.value);
}

export async function setAuthCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, await buildToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
