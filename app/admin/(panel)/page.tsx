import Link from "next/link";
import { safeSql, isDbConfigured } from "@/lib/db";
import { Users, Heart, Handshake, ClipboardList, MessageSquare, Newspaper } from "lucide-react";

type CountRow = { count: string };
type RecentRow = {
  source: string;
  id: number;
  label: string;
  detail: string;
  submitted_at: string;
};

const TILES = [
  { type: "families", label: "Families", icon: Users },
  { type: "community", label: "Community", icon: Heart },
  { type: "partners", label: "Partners", icon: Handshake },
  { type: "surveys", label: "Surveys", icon: ClipboardList },
  { type: "contacts", label: "Contacts", icon: MessageSquare },
  { type: "updates", label: "Updates", icon: Newspaper },
] as const;

async function getCounts() {
  if (!isDbConfigured()) {
    return TILES.map((t) => ({ ...t, count: 0 }));
  }
  const [f, c, p, s, ct, u] = await Promise.all([
    safeSql<CountRow>`SELECT COUNT(*)::text AS count FROM families`,
    safeSql<CountRow>`SELECT COUNT(*)::text AS count FROM community`,
    safeSql<CountRow>`SELECT COUNT(*)::text AS count FROM partners`,
    safeSql<CountRow>`SELECT COUNT(*)::text AS count FROM surveys`,
    safeSql<CountRow>`SELECT COUNT(*)::text AS count FROM contacts`,
    safeSql<CountRow>`SELECT COUNT(*)::text AS count FROM updates`,
  ]);
  return [
    { ...TILES[0], count: Number(f.rows[0]?.count || 0) },
    { ...TILES[1], count: Number(c.rows[0]?.count || 0) },
    { ...TILES[2], count: Number(p.rows[0]?.count || 0) },
    { ...TILES[3], count: Number(s.rows[0]?.count || 0) },
    { ...TILES[4], count: Number(ct.rows[0]?.count || 0) },
    { ...TILES[5], count: Number(u.rows[0]?.count || 0) },
  ];
}

async function getRecent(): Promise<RecentRow[]> {
  if (!isDbConfigured()) return [];
  const { rows } = await safeSql<RecentRow>`
    SELECT * FROM (
      SELECT 'families' AS source, id, parent_name AS label, email AS detail, submitted_at FROM families
      UNION ALL
      SELECT 'community', id, name, email, submitted_at FROM community
      UNION ALL
      SELECT 'partners', id, organization, email, submitted_at FROM partners
      UNION ALL
      SELECT 'surveys', id, COALESCE(name, 'Anonymous'), COALESCE(email, '—'), submitted_at FROM surveys
      UNION ALL
      SELECT 'contacts', id, name, subject, submitted_at FROM contacts
    ) AS combined
    ORDER BY submitted_at DESC
    LIMIT 5
  `;
  return rows;
}

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
}

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [counts, recent] = await Promise.all([getCounts(), getRecent()]);
  const dbReady = isDbConfigured();
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-eventide">Admin</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-midnight">Dashboard</h1>
          <p className="mt-2 text-midnight-75 max-w-2xl">
            Submission counts and the most recent activity across every form on the site.
          </p>
        </div>
      </header>

      {!dbReady && (
        <div className="mt-6 rounded-xl bg-white border border-ion p-5 text-sm text-midnight">
          <strong>Database is not configured.</strong> Set <code>POSTGRES_URL</code> in your environment
          and call <code>/api/init?password=YOUR_ADMIN_PASSWORD</code> once to create tables.
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.type}
              href={`/admin/${t.type}`}
              className="rounded-2xl bg-white border border-ion p-6 hover:border-eventide transition"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow text-eventide">{t.label}</span>
                <Icon size={20} className="text-eventide" aria-hidden />
              </div>
              <p className="mt-4 text-4xl font-semibold text-midnight">{t.count}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-midnight">Most recent submissions</h2>
        <div className="mt-4 rounded-2xl bg-white border border-ion overflow-hidden">
          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-midnight-75">
              {dbReady ? "No submissions yet." : "Submissions will appear here once the database is connected."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ion-soft text-eventide">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">When</th>
                  <th className="px-5 py-3 text-left font-semibold">Source</th>
                  <th className="px-5 py-3 text-left font-semibold">Who</th>
                  <th className="px-5 py-3 text-left font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={`${r.source}-${r.id}`} className="border-t border-ion/60">
                    <td className="px-5 py-3 text-midnight-75 whitespace-nowrap">{formatDateTime(r.submitted_at)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/${r.source}`} className="text-eventide font-medium hover:underline">
                        {r.source}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-midnight">{r.label}</td>
                    <td className="px-5 py-3 text-midnight-75">{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
