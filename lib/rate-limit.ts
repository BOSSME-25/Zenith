import "server-only";
import { createHash } from "node:crypto";
import { safeSql, isDbConfigured } from "@/lib/db";

/**
 * Per-IP rate limiting for public form submissions, scoped per form.
 *
 * Postgres-backed because it is already a hard dependency here; this avoids
 * provisioning a KV store for forms that see a handful of submissions a week.
 *
 * The raw IP is never stored — only a salted SHA-256 hash, which is enough to
 * count repeat submitters without retaining an identifier for people
 * submitting family and student details.
 *
 * Limits are deliberately generous. Zenith signs families up at community
 * tabling events, where many legitimate submissions share one phone hotspot or
 * tablet. A tight cap would break that before it stopped any spam. Rate
 * limiting here is a flood guard; the honeypot and Turnstile are what stop the
 * low-and-slow spam this site actually receives.
 */
export type RateScope =
  | "nomination"
  | "contact"
  | "family"
  | "community"
  | "partner"
  | "newsletter"
  | "mentor"
  | "feedback";

export const DEFAULT_WINDOW_MINUTES = 60;

function hashIp(ip: string): string {
  const salt = process.env.AUTH_SECRET || "zenith-rate-limit";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Pulls the client IP from the proxy headers Vercel sets. */
export function clientIpFrom(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip");
}

export async function checkRateLimit(
  scope: RateScope,
  ip: string | null,
  limit: number,
  windowMinutes: number = DEFAULT_WINDOW_MINUTES,
): Promise<{ allowed: boolean; remaining: number }> {
  // With no database or no resolvable IP there is nothing to count against.
  if (!ip || !isDbConfigured()) return { allowed: true, remaining: limit };

  const ipHash = hashIp(ip);
  try {
    await safeSql`
      DELETE FROM form_rate_limit WHERE created_at < NOW() - INTERVAL '1 day'
    `;
    const { rows } = await safeSql<{ count: string }>`
      SELECT COUNT(*)::text AS count FROM form_rate_limit
      WHERE scope = ${scope}
        AND ip_hash = ${ipHash}
        AND created_at > NOW() - (${windowMinutes} * INTERVAL '1 minute')
    `;
    const used = Number(rows[0]?.count ?? 0);
    if (used >= limit) return { allowed: false, remaining: 0 };
    return { allowed: true, remaining: limit - used };
  } catch {
    // Never block a legitimate submission because the limiter itself failed.
    return { allowed: true, remaining: limit };
  }
}

export async function recordAttempt(scope: RateScope, ip: string | null): Promise<void> {
  if (!ip || !isDbConfigured()) return;
  try {
    await safeSql`INSERT INTO form_rate_limit (scope, ip_hash) VALUES (${scope}, ${hashIp(ip)})`;
  } catch {
    // Non-fatal.
  }
}
