import { Section } from "@/components/Section";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Mail, Sparkles, Users } from "lucide-react";

export const metadata = {
  title: "Newsletter",
  description:
    "The Zenith newsletter is coming soon. Sign up to be the first to receive community milestones, school-design updates, and ways to get involved.",
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

export default function NewsletterPage() {
  return (
    <>
      <Section
        eyebrow="Coming Soon"
        title="The Zenith Newsletter."
        description="We're putting together a newsletter to keep families, neighbors, and partners close to the journey as we prepare to open Zenith in Maryvale. Be the first to know when it launches."
        bg="white"
      />

      <Section bg="ion-soft" className="pt-0 md:pt-0">
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
