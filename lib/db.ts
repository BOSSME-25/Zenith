import "server-only";
import { Pool, type QueryResult, type QueryResultRow } from "pg";

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

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getConnectionString(),
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
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

function buildParameterized(strings: TemplateStringsArray, values: unknown[]) {
  let text = strings[0];
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}${strings[i + 1]}`;
  }
  return { text, values };
}

export const safeSql: SqlFn = (async <T extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<QueryResult<T>> => {
  if (!isDbConfigured()) {
    warnOnce();
    return emptyResult<T>();
  }
  const { text, values: params } = buildParameterized(strings, values);
  return (await getPool().query<T>(text, params as never[])) as QueryResult<T>;
}) as SqlFn;

export async function safeQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  if (!isDbConfigured()) {
    warnOnce();
    return emptyResult<T>();
  }
  return (await getPool().query<T>(text, values as never[])) as QueryResult<T>;
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
  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    submitted_at TIMESTAMP DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    name TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS newsletter_issues (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    issue_number INTEGER NOT NULL,
    month_label TEXT NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    hero_image_url TEXT,
    hero_title TEXT NOT NULL,
    hero_text TEXT,
    hero_cta_label TEXT,
    hero_cta_url TEXT,
    founder_note TEXT,
    spotlight_image_url TEXT,
    spotlight_name TEXT,
    spotlight_text TEXT,
    events JSONB DEFAULT '[]',
    classroom_title TEXT,
    classroom_text TEXT,
    stat_value TEXT,
    stat_text TEXT
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
  // Nominations are raw, unreviewed submissions. They are never rendered on the
  // public site — nominator_email and nominee_contact_info in particular must
  // stay internal. Publishing happens only through comet_profiles below.
  `CREATE TABLE IF NOT EXISTS nominations (
    id SERIAL PRIMARY KEY,
    submitted_at TIMESTAMP DEFAULT NOW(),
    nominee_name TEXT NOT NULL,
    nominee_grade_or_grad_year TEXT NOT NULL,
    nominator_name TEXT NOT NULL,
    nominator_relationship TEXT NOT NULL,
    nominator_email TEXT NOT NULL,
    milestone_type TEXT NOT NULL,
    description TEXT NOT NULL,
    nominee_contact_info TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewed_by TEXT,
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    submission_duration_ms INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS comet_profiles (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'in_motion',
    name TEXT NOT NULL,
    photo_url TEXT,
    grad_year INTEGER,
    current_grade INTEGER,
    milestone_type TEXT NOT NULL DEFAULT 'general_story',
    headline TEXT NOT NULL DEFAULT '',
    full_story TEXT NOT NULL DEFAULT '',
    certifications TEXT[] DEFAULT '{}',
    field_or_institution TEXT,
    current_role_or_program TEXT,
    mentor_opt_in BOOLEAN DEFAULT FALSE,
    mentor_contact_method TEXT DEFAULT 'none',
    tags TEXT[] DEFAULT '{}',
    consent_on_file BOOLEAN DEFAULT FALSE,
    consent_recorded_by TEXT,
    featured_quarter TEXT,
    published_at TIMESTAMP,
    source_nomination_id INTEGER
  )`,
  // Stores a salted hash of the submitter IP, never the address itself.
  `CREATE TABLE IF NOT EXISTS nomination_rate_limit (
    id SERIAL PRIMARY KEY,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS nomination_rate_limit_lookup
     ON nomination_rate_limit (ip_hash, created_at)`,
  `CREATE INDEX IF NOT EXISTS nominations_status_idx ON nominations (status, submitted_at DESC)`,
  `CREATE INDEX IF NOT EXISTS comet_profiles_published_idx ON comet_profiles (published_at, status)`,
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
