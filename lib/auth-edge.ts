export const ADMIN_COOKIE_NAME = "zenith_admin";
const ONE_DAY = 60 * 60 * 24;
export const ADMIN_COOKIE_MAX_AGE = ONE_DAY * 7;

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

export async function sign(value: string): Promise<string> {
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

export async function buildToken(): Promise<string> {
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
  if (Date.now() - issuedAt >= ADMIN_COOKIE_MAX_AGE * 1000) return false;
  const expected = await sign(issued);
  return constantTimeEqualHex(expected, sig);
}
