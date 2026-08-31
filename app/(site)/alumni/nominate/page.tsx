import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Section } from "@/components/Section";
import { NominationForm } from "@/components/forms/NominationForm";

export const metadata = {
  title: "Nominate a Comet",
  description:
    "Nominate a Zenith student or graduate whose milestone deserves recognition — dual enrollment, a CTE certification, AP achievement, or a story worth telling.",
  alternates: { canonical: "/alumni/nominate" },
};

export default function NominatePage() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null;

  return (
    <>
      <Section
        eyebrow="Nominate"
        title="Tell us about a Comet."
        description="Students, staff, families, and community members can all nominate. You can nominate yourself, too."
        bg="white"
      >
        <Link
          href="/alumni"
          className="inline-flex items-center gap-2 text-sm font-semibold text-eventide hover:text-midnight"
        >
          <ArrowLeft size={16} aria-hidden /> Back to Comets
        </Link>
      </Section>

      <Section bg="ion-soft">
        <div className="max-w-2xl">
          <div className="rounded-2xl bg-white border border-ion p-5 mb-8 flex items-start gap-3">
            <ShieldCheck size={20} aria-hidden className="mt-0.5 flex-none text-aurora" />
            <div>
              <p className="text-sm font-semibold text-midnight">How we handle nominations</p>
              <p className="mt-1.5 text-sm leading-relaxed text-midnight-75">
                Nothing is published automatically. Every nomination goes to our team for review,
                and we confirm consent before a profile goes live — for students under 18, that
                means a parent or guardian signs off. Your email and any contact details you share
                stay internal.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-ion p-6 md:p-8">
            <NominationForm turnstileSiteKey={siteKey} />
          </div>
        </div>
      </Section>
    </>
  );
}
