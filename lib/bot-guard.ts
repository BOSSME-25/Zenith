import "server-only";
import { headers } from "next/headers";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  type RateScope,
  checkRateLimit,
  clientIpFrom,
  recordAttempt,
} from "@/lib/rate-limit";

/**
 * Layered bot protection shared by every public form.
 *
 * Each layer is cheap and independent:
 *   1. Honeypot  — an off-screen field real browsers leave empty.
 *   2. Time trap — submissions faster than a human could plausibly type.
 *   3. Turnstile — Cloudflare's CAPTCHA, verified server-side.
 *   4. Rate limit — per-IP flood guard.
 *
 * Layers 1 and 2 cost the visitor nothing and work with no configuration.
 * Turnstile no-ops when unconfigured (see lib/turnstile.ts), so a deployment
 * without keys is degraded rather than broken.
 */

/** Generic on purpose: never tell a bot which layer caught it. */
const GENERIC_REJECTION =
  "We couldn't accept that submission. Please refresh the page and try again.";

export type GuardOptions = {
  scope: RateScope;
  /** Per-IP submissions allowed per hour. */
  limit: number;
  /**
   * Minimum plausible fill time. Short forms that browsers can autofill need a
   * lower bar than long ones, or real people trip it.
   */
  minMs?: number;
  /** Set false for forms where a visible widget would be disproportionate. */
  turnstile?: boolean;
};

export type GuardResult =
  | { ok: true; ip: string | null; durationMs: number }
  | { ok: false; message: string };

export async function guardSubmission(
  formData: FormData,
  { scope, limit, minMs = 3000, turnstile = true }: GuardOptions,
): Promise<GuardResult> {
  // 1. Honeypot.
  if (String(formData.get("website") ?? "").trim().length > 0) {
    return { ok: false, message: GENERIC_REJECTION };
  }

  // 2. Time trap. The client stamps form-load time and the elapsed value is
  //    computed here. A skewed client clock yields a non-positive duration,
  //    which is ignored rather than treated as a bot.
  const loadedAt = Number(formData.get("form_loaded_at") ?? 0);
  const durationMs = Number.isFinite(loadedAt) && loadedAt > 0 ? Date.now() - loadedAt : 0;
  if (durationMs > 0 && durationMs < minMs) {
    return { ok: false, message: GENERIC_REJECTION };
  }

  const ip = clientIpFrom(await headers());

  // 3. Turnstile.
  if (turnstile) {
    const result = await verifyTurnstile(
      String(formData.get("cf-turnstile-response") ?? "") || null,
      ip,
    );
    if (!result.ok) {
      return {
        ok: false,
        message: "We couldn't verify that you're human. Please complete the check and try again.",
      };
    }
  }

  // 4. Rate limit.
  const rate = await checkRateLimit(scope, ip, limit);
  if (!rate.allowed) {
    return {
      ok: false,
      message:
        "You've submitted this form several times recently. Please try again later, or email us directly.",
    };
  }

  // Counted here rather than after validation, so a bot posting malformed
  // payloads still burns its allowance.
  await recordAttempt(scope, ip);
  return { ok: true, ip, durationMs };
}
