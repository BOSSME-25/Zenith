import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}

let warnedUnconfigured = false;

/**
 * Verifies a Turnstile token server-side.
 *
 * Consistent with the rest of this codebase (database, email), an unset key is
 * a no-op rather than a hard failure, so local development and preview builds
 * work without Cloudflare credentials. The honeypot, time trap, rate limit, and
 * — critically — the staff moderation queue all still apply, so an
 * unconfigured deployment is degraded but never publishes unreviewed content.
 * A missing key in production is logged loudly on every attempt.
 */
export async function verifyTurnstile(
  token: string | null,
  ip: string | null,
): Promise<{ ok: boolean; reason?: string }> {
  if (!isTurnstileConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[zenith][turnstile] TURNSTILE_SECRET_KEY is not set — CAPTCHA verification is being skipped in production. Set it in the Vercel project settings.",
      );
    } else if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.warn("[zenith][turnstile] Not configured — skipping CAPTCHA verification.");
    }
    return { ok: true, reason: "turnstile-not-configured" };
  }

  if (!token) return { ok: false, reason: "missing-token" };

  try {
    const body = new URLSearchParams();
    body.set("secret", process.env.TURNSTILE_SECRET_KEY as string);
    body.set("response", token);
    if (ip) body.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success) return { ok: true };
    return { ok: false, reason: data["error-codes"]?.join(",") || "verification-failed" };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "verification-error" };
  }
}
