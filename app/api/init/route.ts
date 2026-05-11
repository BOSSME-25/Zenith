import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";
import { verifyPassword, adminPasswordConfigured } from "@/lib/auth";

async function authorize(req: Request): Promise<{ ok: boolean; message?: string }> {
  if (!adminPasswordConfigured()) {
    return { ok: false, message: "ADMIN_PASSWORD must be configured before running init." };
  }
  const url = new URL(req.url);
  const queryPassword = url.searchParams.get("password");
  if (queryPassword && verifyPassword(queryPassword)) return { ok: true };
  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (bearer && verifyPassword(bearer)) return { ok: true };
  return { ok: false, message: "Unauthorized." };
}

async function run(req: Request) {
  const auth = await authorize(req);
  if (!auth.ok) return NextResponse.json({ ok: false, message: auth.message }, { status: 401 });
  const result = await initDatabase();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(req: Request) {
  return run(req);
}

export async function GET(req: Request) {
  return run(req);
}
