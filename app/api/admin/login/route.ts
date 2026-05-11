import { NextResponse } from "next/server";
import { adminPasswordConfigured, setAuthCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  if (!adminPasswordConfigured()) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_PASSWORD is not configured." },
      { status: 500 },
    );
  }
  let body: { password?: string } = {};
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }
  const password = (body.password || "").toString();
  if (!password || !verifyPassword(password)) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: false, message: "Incorrect password." }, { status: 401 });
  }
  await setAuthCookie();
  return NextResponse.json({ ok: true });
}
