import Link from "next/link";
import { ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import { Section } from "@/components/Section";
import { CometCard, type PublicComet } from "@/components/CometCard";
import { safeSql } from "@/lib/db";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

/** Fall 2027 opening, four-year cohort. */
const FIRST_GRADUATING_CLASS = 2031;

export const metadata = {
  title: "Comets in Motion",
  description:
    "Milestones from Zenith students and alumni — dual enrollment, CTE certifications, and AP achievement. Nominate a Comet whose work deserves recognition.",
  alternates: { canonical: "/alumni" },
};

// Only published profiles are ever selected, and only the public columns.
async function getComets(): Promise<PublicComet[]> {
  const { rows } = await safeSql<PublicComet>`
    SELECT id, status, name, photo_url, grad_year, current_grade, milestone_type,
           headline, full_story, certifications, field_or_institution,
           current_role_or_program, mentor_opt_in, tags
    FROM comet_profiles
    WHERE published_at IS NOT NULL
    ORDER BY featured_quarter DESC NULLS LAST, published_at DESC
  `;
  return rows.map((r) => ({
    ...r,
    certifications: r.certifications ?? [],
    tags: r.tags ?? [],
  }));
}

function NominateCta({ variant = "light" }: { variant?: "light" | "dark" }) {
  return (
    <Link
      href="/alumni/nominate"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm md:text-base font-semibold transition-colors active:scale-95",
        variant === "dark"
          ? "bg-ion text-midnight hover:bg-white"
          : "bg-midnight text-white hover:bg-midnight-75",
      )}
    >
      Nominate a Comet <ArrowRight size={16} aria-hidden />
    </Link>
  );
}

export default async function AlumniPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const all = await getComets();

  const allTags = Array.from(new Set(all.flatMap((c) => c.tags))).sort();
  const activeTag = tag && allTags.includes(tag) ? tag : null;
  const visible = activeTag ? all.filter((c) => c.tags.includes(activeTag)) : all;

  const inMotion = visible.filter((c) => c.status === "in_motion");
  const landed = visible.filter((c) => c.status === "landed");

  return (
    <>
      <Section
        eyebrow="Comets"
        title="Comets in Motion. Comets who've landed."
        description="Every Zenith scholar is going somewhere. This is where we mark the milestones along the way — college credit earned early, certifications completed, and the paths our graduates build after they leave us."
        bg="white"
      >
        <NominateCta />
      </Section>

      {allTags.length > 0 && (
        <section className="bg-ion-soft border-y border-ion py-5">
          <div className="container-prose flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-midnight mr-1">Browse by field:</span>
            <Link
              href="/alumni"
              aria-current={!activeTag ? "true" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                !activeTag
                  ? "bg-midnight text-white border-midnight"
                  : "bg-white text-midnight border-ion hover:bg-ion-soft",
              )}
            >
              All
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/alumni?tag=${encodeURIComponent(t)}`}
                aria-current={activeTag === t ? "true" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                  activeTag === t
                    ? "bg-midnight text-white border-midnight"
                    : "bg-white text-midnight border-ion hover:bg-ion-soft",
                )}
              >
                {t}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comets in Motion leads the page — it will carry the content for years
          before the first class graduates. */}
      <Section
        eyebrow="Currently enrolled"
        title={
          <span className="inline-flex items-center gap-3">
            <Sparkles size={26} aria-hidden className="text-aurora" /> Comets in Motion
          </span>
        }
        description="Students earning college credit, completing industry certifications, and building toward what comes next."
        bg="ion-soft"
      >
        {inMotion.length === 0 ? (
          <div className="rounded-2xl bg-white border border-ion p-8 text-center">
            <p className="text-lg font-semibold text-midnight">
              {activeTag ? "No Comets in this field yet." : "The first milestones are on their way."}
            </p>
            <p className="mt-2 text-midnight-75">
              {activeTag
                ? "Try another field, or nominate someone whose work belongs here."
                : "Know a Zenith student hitting a dual enrollment or certification milestone? Tell us about them."}
            </p>
            <div className="mt-6">
              <NominateCta />
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inMotion.map((comet) => (
                <CometCard key={comet.id} comet={comet} />
              ))}
            </div>
            <div className="mt-10">
              <NominateCta />
            </div>
          </>
        )}
      </Section>

      {/* Until the first cohort graduates this collapses to a placeholder rather
          than rendering an empty grid. */}
      <Section
        eyebrow="Graduates"
        title={
          <span className="inline-flex items-center gap-3">
            <GraduationCap size={26} aria-hidden className="text-eventide" /> Comets Who&apos;ve Landed
          </span>
        }
        bg="white"
      >
        {landed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-eventide-50 bg-ion-soft p-8 md:p-10 max-w-2xl">
            <p className="eyebrow text-eventide">Coming soon</p>
            <p className="mt-3 text-xl font-semibold text-midnight">
              Our first class graduates in {FIRST_GRADUATING_CLASS}.
            </p>
            <p className="mt-3 leading-relaxed text-midnight-75">
              Zenith opens with its founding 9th grade class in Fall 2027. When that cohort walks
              across the stage, this is where you&apos;ll find them — in college, in apprenticeships,
              and in careers across Arizona.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {landed.map((comet) => (
              <CometCard key={comet.id} comet={comet} />
            ))}
          </div>
        )}
      </Section>

      <Section bg="midnight">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="eyebrow text-ion">Know a Comet?</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              Nominate a student or graduate.
            </p>
            <p className="mt-2 text-white/85 max-w-xl">
              Anyone can nominate — students, staff, families, and community members. Every
              nomination is reviewed by our team, and we confirm consent before publishing anything.
            </p>
          </div>
          <NominateCta variant="dark" />
        </div>
      </Section>
    </>
  );
}
