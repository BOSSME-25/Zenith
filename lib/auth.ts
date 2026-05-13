import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE,
  buildToken,
  verifyTokenValue,
} from "./auth-edge";

export { ADMIN_COOKIE_NAME, verifyTokenValue };

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
  return verifyTokenValue(store.get(ADMIN_COOKIE_NAME)?.value);
}

export async function setAuthCookie(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, await buildToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
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
