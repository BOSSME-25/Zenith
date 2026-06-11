import Link from "next/link";
import { safeSql, isDbConfigured } from "@/lib/db";
import { Section } from "@/components/Section";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Updates" };
export const dynamic = "force-dynamic";

type UpdateRow = {
  id: number;
  title: string;
  slug: string;
  body: string;
  publish_date: string;
  published: boolean;
};

function formatDate(d: string | Date): string {
  try {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

function excerpt(body: string, max = 220): string {
  const plain = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // drop image markdown
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? plain.slice(0, max).trimEnd() + "…" : plain;
}

export default async function UpdatesPage() {
  const { rows } = await safeSql<UpdateRow>`
    SELECT id, title, slug, body, publish_date, published
    FROM updates
    WHERE published = TRUE
    ORDER BY publish_date DESC
    LIMIT 50
  `;

  return (
    <>
      <Section
        eyebrow="Updates"
        title="News from Zenith."
        description="Milestones from charter application, community engagement, founding-board work, and what&apos;s next as we prepare to open Zenith in Maryvale."
        bg="white"
      />
      <Section bg="ion-soft">
        {rows.length === 0 ? (
          <div className="rounded-2xl bg-white border border-ion p-10 text-center max-w-2xl mx-auto">
            <p className="eyebrow text-eventide">Coming Soon</p>
            <p className="mt-3 text-xl font-semibold text-midnight">
              {isDbConfigured()
                ? "We&apos;re preparing the first update."
                : "Updates will appear here once the team publishes them."}
            </p>
            <p className="mt-3 text-midnight-75">
              In the meantime, join the Interest List to be notified of the first community milestones.
            </p>
            <Link
              href="/get-involved#family"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-midnight px-6 py-3 text-sm font-semibold text-white hover:bg-midnight-75 transition-colors"
            >
              Join the Interest List
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {rows.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/updates/${u.slug}`}
                  className="block rounded-2xl bg-white border border-ion p-7 h-full hover:border-eventide hover:shadow-sm transition"
                >
                  <p className="text-sm font-medium text-eventide">{formatDate(u.publish_date)}</p>
                  <h3 className="mt-2 text-xl md:text-2xl font-semibold text-midnight leading-tight">
                    {u.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-midnight-75">
                    {excerpt(u.body)}
                  </p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-eventide">
                    Read more <ArrowRight size={16} aria-hidden />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
