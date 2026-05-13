import "server-only";
import {
  createPool,
  type QueryResult,
  type QueryResultRow,
  type VercelPool,
} from "@vercel/postgres";

/**
 * Resolve the connection string from any of the env var names Neon/Vercel
 * marketplace integrations might expose. The non-pooling URL is also acceptable
 * because we drive the pool ourselves below; @vercel/postgres's `sql` tag is
 * the one that mandates a pooler hostname.
 */
function getConnectionString(): string | undefined {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.PRISMA_DATABASE_URL
  );
}

export function isDbConfigured(): boolean {
  return Boolean(getConnectionString());
}

let pool: VercelPool | null = null;
function getPool(): VercelPool {
  if (!pool) {
    pool = createPool({ connectionString: getConnectionString() });
  }
  return pool;
}

let warnedMissingEnv = false;
function warnOnce() {
  if (!warnedMissingEnv && process.env.NODE_ENV !== "production") {
    warnedMissingEnv = true;
    console.warn(
      "[zenith] No database URL is set — database calls are no-ops. " +
        "Set POSTGRES_URL (or DATABASE_URL) in .env.local or on Vercel to enable persistence.",
    );
  }
}

const emptyResult = <T extends QueryResultRow>(): QueryResult<T> =>
  ({ rows: [], rowCount: 0, command: "", oid: 0, fields: [] } as unknown as QueryResult<T>);

type SqlFn = <T extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<QueryResult<T>>;

/**
 * Safe sql tag that returns an empty result if the DB is not configured.
 */
export const safeSql: SqlFn = (async <T extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<QueryResult<T>> => {
  if (!isDbConfigured()) {
    warnOnce();
    return emptyResult<T>();
  }
  return getPool().sql<T>(strings, ...(values as never[]));
}) as SqlFn;

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
    return emptyResult<T>();
  }
  return (await getPool().query(text, values as never[])) as unknown as QueryResult<T>;
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
    const p = getPool();
    for (const stmt of CREATE_STATEMENTS) {
      await p.query(stmt);
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
