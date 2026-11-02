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

/**
 * In production a missing database must never look like success.
 *
 * Locally the app is designed to run with no environment at all, so there a
 * missing database stays a harmless no-op. In production it would mean a family
 * sees "Thanks for joining" while their entry is silently discarded, so the
 * form must refuse instead — and say so in the logs.
 */
export function submissionsUnavailable(): boolean {
  if (process.env.NODE_ENV !== "production" || isDbConfigured()) return false;
  console.error(
    "[zenith][db] A form submission was REFUSED because no database URL is set. " +
      "Set POSTGRES_URL (or DATABASE_URL) in the Vercel project settings and redeploy.",
  );
  return true;
}

export const SUBMISSIONS_UNAVAILABLE_MESSAGE =
  "We can't save your submission right now. Please try again in a little while.";

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
  if (warnedMissingEnv) return;
  warnedMissingEnv = true;
  if (process.env.NODE_ENV === "production") {
    // In production this is data loss, not a dev convenience: form submissions
    // still report success to the visitor while being silently discarded.
    console.error(
      "[zenith][db] No database URL is set — submissions are NOT being saved. " +
        "Set POSTGRES_URL (or DATABASE_URL) in the Vercel project settings and redeploy. " +
        "Note that a storage integration may expose these prefixed (e.g. ZenStore_POSTGRES_URL), " +
        "which this app does not read.",
    );
  } else {
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
  // Suggestions and requested information sent by board members, faculty and
  // staff from the admin sign-in page. Written without a login, so every field
  // is treated as untrusted text; read only through the authenticated admin.
  `CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    submitted_at TIMESTAMP DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL,
    topic TEXT NOT NULL,
    page TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    resolved_at TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback (status, submitted_at DESC)`,
  // Stores a salted hash of the submitter IP, never the address itself.
  // `scope` is the form the attempt belongs to (contact, family, …).
  `CREATE TABLE IF NOT EXISTS form_rate_limit (
    id SERIAL PRIMARY KEY,
    scope TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS form_rate_limit_lookup
     ON form_rate_limit (scope, ip_hash, created_at)`,
  `CREATE INDEX IF NOT EXISTS nominations_status_idx ON nominations (status, submitted_at DESC)`,
  `CREATE INDEX IF NOT EXISTS comet_profiles_published_idx ON comet_profiles (published_at, status)`,
  // Public meetings. A meeting row is a public record once it leaves draft, so
  // nothing here is ever hard-deleted through the UI and documents are
  // superseded or withdrawn rather than removed.
  `CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    meeting_type TEXT NOT NULL
      CHECK (meeting_type IN ('regular','special','emergency','committee','budget_hearing','work_session')),
    committee_name TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    location_name TEXT,
    location_address TEXT,
    virtual_url TEXT,
    virtual_meeting_id TEXT,
    virtual_passcode TEXT,
    dial_in TEXT,
    status TEXT NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft','scheduled','cancelled','rescheduled','held')),
    rescheduled_to UUID REFERENCES meetings(id),
    status_reason TEXT,
    emergency_reason TEXT,
    notice_posted_at TIMESTAMPTZ,
    agenda_posted_at TIMESTAMPTZ,
    minutes_status TEXT NOT NULL DEFAULT 'none'
      CHECK (minutes_status IN ('none','draft','approved')),
    minutes_approved_at TIMESTAMPTZ,
    recording_url TEXT,
    public_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS meeting_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE RESTRICT,
    kind TEXT NOT NULL CHECK (kind IN ('agenda','minutes','packet','other')),
    label TEXT NOT NULL,
    blob_url TEXT NOT NULL,
    size_bytes INTEGER,
    version INTEGER NOT NULL DEFAULT 1,
    superseded_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    withdrawn_reason TEXT,
    uploaded_by TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS meeting_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id),
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    detail JSONB,
    at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS meetings_starts_idx ON meetings (starts_at DESC)`,
  `CREATE INDEX IF NOT EXISTS meeting_documents_meeting_idx ON meeting_documents (meeting_id, kind)`,
  `CREATE INDEX IF NOT EXISTS meeting_audit_meeting_idx ON meeting_audit (meeting_id, at DESC)`,
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
