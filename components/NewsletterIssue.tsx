import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { IssueEvent } from "@/lib/validators";

export type IssueData = {
  id: number;
  issue_number: number;
  month_label: string;
  hero_image_url: string | null;
  hero_title: string;
  hero_text: string | null;
  hero_cta_label: string | null;
  hero_cta_url: string | null;
  founder_note: string | null;
  spotlight_image_url: string | null;
  spotlight_name: string | null;
  spotlight_text: string | null;
  events: IssueEvent[] | null;
  classroom_title: string | null;
  classroom_text: string | null;
  stat_value: string | null;
  stat_text: string | null;
};

const GET_INVOLVED = [
  { label: "Volunteer", href: "/get-involved#community" },
  { label: "Partner with us", href: "/get-involved#partner" },
  { label: "Support", href: "/get-involved" },
];

export function NewsletterIssue({ issue }: { issue: IssueData }) {
  const events = (issue.events ?? []).filter((e) => e.title);
  return (
    <article className="max-w-3xl mx-auto">
      {/* Masthead */}
      <header className="text-center border-b-2 border-midnight pb-6">
        <p className="text-3xl md:text-5xl font-bold tracking-tight text-midnight">THE COMET TRAIL</p>
        <p className="mt-3 eyebrow text-eventide">
          Issue {String(issue.issue_number).padStart(2, "0")} &nbsp;•&nbsp; {issue.month_label}
        </p>
      </header>

      {/* Hero */}
      <section className="mt-10">
        {issue.hero_image_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={issue.hero_image_url}
            alt=""
            className="w-full aspect-[11/5] object-cover rounded-2xl border border-ion"
          />
        )}
        <h1 className="mt-7 text-3xl md:text-4xl font-bold leading-tight text-midnight">
          {issue.hero_title}
        </h1>
        {issue.hero_text && (
          <p className="mt-4 text-lg leading-relaxed text-midnight-75">{issue.hero_text}</p>
        )}
        {issue.hero_cta_label && issue.hero_cta_url && (
          <Link
            href={issue.hero_cta_url}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-midnight px-6 py-3 text-sm font-semibold text-white hover:bg-midnight-75 transition-colors"
          >
            {issue.hero_cta_label}
            <ArrowRight size={16} aria-hidden />
          </Link>
        )}
      </section>

      {/* Founder note + Spotlight */}
      {(issue.founder_note || issue.spotlight_text || issue.spotlight_name) && (
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {issue.founder_note && (
            <div className="rounded-2xl bg-ion-soft border border-ion p-7">
              <p className="eyebrow text-eventide">From Dr. Samant</p>
              <p className="mt-4 text-base leading-relaxed text-midnight">{issue.founder_note}</p>
              <p className="mt-5 font-semibold text-midnight">Dr. Jay Samant</p>
              <p className="text-sm text-midnight-75">Founder &amp; CEO</p>
            </div>
          )}
          {(issue.spotlight_text || issue.spotlight_name) && (
            <div className="rounded-2xl bg-white border border-ion p-7">
              <p className="eyebrow text-eventide">Comet Spotlight</p>
              {issue.spotlight_image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={issue.spotlight_image_url}
                  alt={issue.spotlight_name || "Comet Spotlight"}
                  className="mt-4 w-full aspect-[4/3] object-cover rounded-xl border border-ion"
                />
              )}
              {issue.spotlight_name && (
                <p className="mt-4 font-semibold text-midnight">{issue.spotlight_name}</p>
              )}
              {issue.spotlight_text && (
                <p className="mt-2 text-base leading-relaxed text-midnight-75">{issue.spotlight_text}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Events */}
      {events.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-midnight">What&rsquo;s Happening</h2>
          <ul className="mt-5 space-y-4">
            {events.map((ev, i) => {
              const inner = (
                <span className="flex items-start gap-4">
                  <span className="flex-none w-14 rounded-xl bg-midnight text-white text-center py-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide">{ev.month}</span>
                    <span className="block text-xl font-bold leading-tight">{ev.day}</span>
                  </span>
                  <span>
                    <span className="block font-semibold text-midnight">{ev.title}</span>
                    {ev.detail && <span className="block mt-1 text-sm text-midnight-75">{ev.detail}</span>}
                  </span>
                </span>
              );
              return (
                <li key={i} className="rounded-2xl bg-white border border-ion p-5">
                  {ev.url ? (
                    <Link href={ev.url} className="block hover:opacity-90">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Inside the Classroom */}
      {(issue.classroom_title || issue.classroom_text) && (
        <section className="mt-12 rounded-2xl bg-white border border-ion p-7">
          <p className="eyebrow text-eventide">Inside the Classroom</p>
          {issue.classroom_title && (
            <h2 className="mt-3 text-xl md:text-2xl font-semibold text-midnight">{issue.classroom_title}</h2>
          )}
          {issue.classroom_text && (
            <p className="mt-3 text-base leading-relaxed text-midnight-75">{issue.classroom_text}</p>
          )}
        </section>
      )}

      {/* Stat */}
      {issue.stat_value && (
        <section className="mt-12 rounded-2xl bg-midnight p-8 md:p-10 text-center">
          <p className="text-5xl md:text-6xl font-bold text-ion">{issue.stat_value}</p>
          {issue.stat_text && (
            <p className="mt-3 text-base md:text-lg text-white/85 max-w-xl mx-auto">{issue.stat_text}</p>
          )}
        </section>
      )}

      {/* Get involved */}
      <section className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-midnight">Get Involved</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {GET_INVOLVED.map((g) => (
            <Link
              key={g.label}
              href={g.href}
              className="inline-flex items-center gap-2 rounded-full border border-ion bg-white px-6 py-2.5 text-sm font-semibold text-midnight hover:border-eventide transition-colors"
            >
              {g.label}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
