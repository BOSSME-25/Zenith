import Link from "next/link";
import { Section } from "@/components/Section";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { NewsletterIssue, type IssueData } from "@/components/NewsletterIssue";
import { safeSql } from "@/lib/db";
import { Mail, Sparkles, Users, ArrowRight, PlayCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Newsletter",
  description:
    "The Comet Trail — the Zenith College and Career Prep newsletter. Community milestones, school-design updates, and ways to get involved.",
};

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: "Milestones first",
    text: "Charter progress, founding-team news, and key dates — straight to your inbox.",
  },
  {
    icon: Users,
    title: "Built with Maryvale",
    text: "Stories from the community shaping Zenith, and ways to lend your voice.",
  },
  {
    icon: Mail,
    title: "No spam, ever",
    text: "A thoughtful note now and then. Unsubscribe anytime with one click.",
  },
];

function WatchVideoCallout() {
  return (
    <Link
      href="/our-story"
      className="group flex items-center gap-4 rounded-2xl bg-white border border-ion p-5 md:p-6 hover:border-eventide transition-colors"
    >
      <span className="flex-none rounded-xl bg-ion-soft p-3 text-eventide">
        <PlayCircle size={24} aria-hidden />
      </span>
      <span className="flex-1">
        <span className="block text-base md:text-lg font-semibold text-midnight">
          New here? Watch a welcome from our founder, Dr. Jay Samant.
        </span>
        <span className="mt-0.5 block text-midnight-75">
          A short hello on the story behind Zenith — over on Our Story.
        </span>
      </span>
      <ArrowRight
        size={18}
        className="flex-none text-eventide transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

export default async function NewsletterPage() {
  const { rows } = await safeSql<IssueData>`
    SELECT * FROM newsletter_issues
    WHERE published = TRUE
    ORDER BY issue_number DESC
    LIMIT 20
  `;
  const [latest, ...older] = rows;

  if (!latest) {
    // No published issue yet — coming-soon page with signup.
    return (
      <>
        <Section
          eyebrow="Coming Soon"
          title="The Zenith Newsletter."
          description="We're putting together a newsletter to keep families, neighbors, and partners close to the journey as we prepare to open Zenith in Maryvale. Be the first to know when it launches."
          bg="white"
        />
        <Section bg="ion-soft" className="pt-0 md:pt-0">
          <div className="mb-8">
            <WatchVideoCallout />
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ul className="grid gap-4 sm:grid-cols-1">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <li
                    key={h.title}
                    className="flex items-start gap-4 rounded-2xl bg-white border border-ion p-6"
                  >
                    <span className="flex-none rounded-xl bg-ion-soft p-3 text-eventide">
                      <Icon size={22} aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-midnight">{h.title}</h3>
                      <p className="mt-1 text-midnight-75 leading-relaxed">{h.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="rounded-2xl bg-white border border-ion p-7 md:p-8">
              <p className="eyebrow text-eventide">Join the list</p>
              <h2 className="mt-2 text-2xl font-semibold text-midnight leading-tight">
                Get the first issue.
              </h2>
              <p className="mt-2 text-midnight-75">
                Drop your email and we&apos;ll let you know the moment the newsletter goes live.
              </p>
              <div className="mt-6">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Section bg="white">
        <div className="mb-10 md:mb-12">
          <WatchVideoCallout />
        </div>
        <NewsletterIssue issue={latest} />
      </Section>

      <Section bg="ion-soft" className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto grid gap-8 md:grid-cols-2 md:items-start">
          <div className="rounded-2xl bg-white border border-ion p-7">
            <p className="eyebrow text-eventide">Subscribe</p>
            <h2 className="mt-2 text-xl font-semibold text-midnight leading-tight">
              Get the next issue in your inbox.
            </h2>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>
          <div>
            <p className="eyebrow text-eventide">Past issues</p>
            {older.length === 0 ? (
              <p className="mt-4 text-midnight-75">
                This is our first issue — the archive will grow from here.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {older.map((iss) => (
                  <li key={iss.id}>
                    <Link
                      href={`/newsletter/${iss.id}`}
                      className="flex items-center justify-between rounded-xl bg-white border border-ion px-5 py-4 hover:border-eventide transition"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-eventide">
                          Issue {String(iss.issue_number).padStart(2, "0")} • {iss.month_label}
                        </span>
                        <span className="block mt-0.5 text-midnight font-medium">{iss.hero_title}</span>
                      </span>
                      <ArrowRight size={16} className="flex-none text-eventide" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
