import { NextResponse } from "next/server";
import { adminPasswordConfigured, signInOwner, signInUser, verifyPassword } from "@/lib/auth";
import { authenticate } from "@/lib/admin-users";
import { checkRateLimit, clientIpFrom, recordAttempt } from "@/lib/rate-limit";

const fail = (message: string, status = 401) =>
  NextResponse.json({ ok: false, message }, { status });

/**
 * One endpoint, two ways in. With an email it checks that person's own login.
 * With no email it checks the developer password (ADMIN_PASSWORD). Wrong
 * emails and wrong passwords get the same answer, and repeated failures from
 * one connection are slowed down.
 */
export async function POST(req: Request) {
  let body: { email?: string; password?: string } = {};
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return fail("Invalid request body.", 400);
  }
  const email = (body.email || "").toString().trim();
  const password = (body.password || "").toString();
  if (!password) return fail("Enter your password.", 400);

  const ip = clientIpFrom(req.headers);
  const rate = await checkRateLimit("login", ip, 20, 15);
  if (!rate.allowed) {
    return fail("Too many sign-in attempts from this connection. Try again in a few minutes.", 429);
  }

  if (!email) {
    if (!adminPasswordConfigured()) return fail("The developer login is not configured.", 500);
    if (!verifyPassword(password)) {
      await recordAttempt("login", ip);
      await new Promise((r) => setTimeout(r, 400));
      return fail("Incorrect password.");
    }
    await signInOwner();
    return NextResponse.json({ ok: true, mustChangePassword: false });
  }

  let result;
  try {
    result = await authenticate(email, password);
  } catch (err) {
    console.error(
      "[zenith][login] Could not check the login. Has /api/init been run on this deployment?",
      err instanceof Error ? err.message : err,
    );
    return fail("Sign-in is not available right now. Please tell the web team.", 500);
  }
  if (!result.ok) {
    await recordAttempt("login", ip);
    if (result.reason === "locked") {
      return fail("Too many wrong passwords. This login is locked for 15 minutes.", 423);
    }
    return fail("Incorrect email or password.");
  }
  await signInUser(result.user.id, result.user.session_version);
  return NextResponse.json({ ok: true, mustChangePassword: result.user.must_change_password });
}
