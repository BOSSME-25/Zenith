import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { safeSql, isDbConfigured } from "@/lib/db";

const TABLES = ["families", "community", "partners", "surveys", "contacts", "newsletter"] as const;
type AllowedTable = (typeof TABLES)[number];

function csvCell(value: unknown): string {
  if (value == null) return "";
  let s: string;
  if (value instanceof Date) s = value.toISOString();
  else if (Array.isArray(value)) s = value.join("; ");
  else s = String(value);
  if (/[",\n\r]/.test(s)) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.map(csvCell).join(",");
  const body = rows.map((r) => keys.map((k) => csvCell(r[k])).join(",")).join("\n");
  return `${header}\n${body}\n`;
}

async function loadRows(table: AllowedTable): Promise<Array<Record<string, unknown>>> {
  switch (table) {
    case "families": {
      const { rows } = await safeSql<Record<string, unknown>>`SELECT * FROM families ORDER BY submitted_at DESC`;
      return rows;
    }
    case "community": {
      const { rows } = await safeSql<Record<string, unknown>>`SELECT * FROM community ORDER BY submitted_at DESC`;
      return rows;
    }
    case "partners": {
      const { rows } = await safeSql<Record<string, unknown>>`SELECT * FROM partners ORDER BY submitted_at DESC`;
      return rows;
    }
    case "surveys": {
      const { rows } = await safeSql<Record<string, unknown>>`SELECT * FROM surveys ORDER BY submitted_at DESC`;
      return rows;
    }
    case "contacts": {
      const { rows } = await safeSql<Record<string, unknown>>`SELECT * FROM contacts ORDER BY submitted_at DESC`;
      return rows;
    }
    case "newsletter": {
      const { rows } = await safeSql<Record<string, unknown>>`SELECT * FROM newsletter_subscribers ORDER BY submitted_at DESC`;
      return rows;
    }
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ type: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const { type } = await ctx.params;
  if (!(TABLES as readonly string[]).includes(type)) {
    return NextResponse.json({ ok: false, message: "Unknown export type." }, { status: 404 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Database is not configured." },
      { status: 503 },
    );
  }
  const rows = await loadRows(type as AllowedTable);
  const csv = rowsToCsv(rows);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="zenith-${type}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
