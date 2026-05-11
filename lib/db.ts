import "server-only";
import { sql, type QueryResult, type QueryResultRow } from "@vercel/postgres";

/**
 * Database availability check.
 * Returns true only when a connection string is configured so the rest
 * of the app can fall back to no-op behavior in pre-deploy environments.
 */
export function isDbConfigured(): boolean {
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL,
  );
}

type SqlTag = typeof sql;

let warnedMissingEnv = false;
function warnOnce() {
  if (!warnedMissingEnv && process.env.NODE_ENV !== "production") {
    warnedMissingEnv = true;
    console.warn(
      "[zenith] POSTGRES_URL is not set — database calls are no-ops. " +
        "Set POSTGRES_URL in .env.local (or link the project on Vercel) to enable persistence.",
    );
  }
}

/**
 * Safe sql tag that returns an empty result if the DB is not configured.
 * Use this everywhere we read or write from server actions and pages.
 */
export const safeSql = (async <T extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<QueryResult<T>> => {
  if (!isDbConfigured()) {
    warnOnce();
    return { rows: [], rowCount: 0, command: "", oid: 0, fields: [] } as unknown as QueryResult<T>;
  }
  return (sql as unknown as SqlTag)<T>(strings, ...(values as never[]));
}) as unknown as SqlTag;

/**
 * Positional-parameter variant for queries that need to bind non-primitive
 * values such as text arrays. No-ops when the DB is not configured.
 */
export async function safeQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  if (!isDbConfigured()) {
    warnOnce();
    return { rows: [], rowCount: 0, command: "", oid: 0, fields: [] } as unknown as QueryResult<T>;
  }
  return (await sql.query(text, values as never[])) as unknown as QueryResult<T>;
}

const CREATE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    submitted_at TIMESTAMP DEFAULT NOW(),
    parent_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    student_name TEXT NOT NULL,
    current_grade TEXT NOT NULL,
    expected_grade TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    preferred_contact TEXT NOT NULL,
    how_heard TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS community (
    id SERIAL PRIMARY KEY,
    submitted_at TIMESTAMP DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    roles TEXT[],
    other_role TEXT,
    interests TEXT[]
  )`,
  `CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    submitted_at TIMESTAMP DEFAULT NOW(),
    organization TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    interests TEXT[],
    description TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    submitted_at TIMESTAMP DEFAULT NOW(),
    is_resident BOOLEAN,
    has_child BOOLEAN,
    career_pathways TEXT[],
    important_to_family TEXT,
    name TEXT,
    email TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    submitted_at TIMESTAMP DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS updates (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    body TEXT NOT NULL,
    published BOOLEAN DEFAULT TRUE,
    publish_date TIMESTAMP DEFAULT NOW()
  )`,
];

export async function initDatabase(): Promise<{ ok: boolean; message: string }> {
  if (!isDbConfigured()) {
    return { ok: false, message: "POSTGRES_URL is not configured." };
  }
  try {
    for (const stmt of CREATE_STATEMENTS) {
      await sql.query(stmt);
    }
    return { ok: true, message: "All tables created (or already existed)." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, message };
  }
}

export type SubmissionTable =
  | "families"
  | "community"
  | "partners"
  | "surveys"
  | "contacts";

export const SUBMISSION_TABLES: SubmissionTable[] = [
  "families",
  "community",
  "partners",
  "surveys",
  "contacts",
];
