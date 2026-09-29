import "server-only";
import { createHash } from "node:crypto";
import { safeSql, isDbConfigured } from "@/lib/db";

/**
 * Postgres-backed IP rate limiting.
 *
 * The spec suggested Edge Config or a KV store; Postgres is already a hard
 * dependency here, so this avoids provisioning another service for a form that
 * sees a handful of submissions a week.
 *
 * The raw IP is never stored — only a salted SHA-256 hash, which is enough to
 * count repeat submitters without retaining an identifier for people
 * nominating minors.
 */
export const NOMINATION_LIMIT = 5;
export const NOMINATION_WINDOW_MINUTES = 60;

function hashIp(ip: string): string {
  const salt = process.env.AUTH_SECRET || "zenith-rate-limit";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Pulls the client IP from proxy headers Vercel sets. */
export function clientIpFrom(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip");
}

export async function checkNominationRateLimit(
  ip: string | null,
): Promise<{ allowed: boolean; remaining: number }> {
  // With no database or no resolvable IP there is nothing to count against.
  // The moderation queue remains the real safeguard.
  if (!ip || !isDbConfigured()) return { allowed: true, remaining: NOMINATION_LIMIT };

  const ipHash = hashIp(ip);
  try {
    await safeSql`
      DELETE FROM nomination_rate_limit
      WHERE created_at < NOW() - INTERVAL '1 day'
    `;
    const { rows } = await safeSql<{ count: string }>`
      SELECT COUNT(*)::text AS count FROM nomination_rate_limit
      WHERE ip_hash = ${ipHash}
        AND created_at > NOW() - (${NOMINATION_WINDOW_MINUTES} * INTERVAL '1 minute')
    `;
    const used = Number(rows[0]?.count ?? 0);
    if (used >= NOMINATION_LIMIT) return { allowed: false, remaining: 0 };
    return { allowed: true, remaining: NOMINATION_LIMIT - used };
  } catch {
    // Never block a legitimate nomination because the limiter itself failed.
    return { allowed: true, remaining: NOMINATION_LIMIT };
  }
}

export async function recordNominationAttempt(ip: string | null): Promise<void> {
  if (!ip || !isDbConfigured()) return;
  try {
    await safeSql`INSERT INTO nomination_rate_limit (ip_hash) VALUES (${hashIp(ip)})`;
  } catch {
    // Non-fatal.
  }
}
