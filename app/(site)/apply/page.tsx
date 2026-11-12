import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Section } from "@/components/Section";
import {
  APPLICATION_URL,
  COGNITO_EMBED_SRC,
  COGNITO_PUBLIC_URL,
  COGNITO_SCRIPT_SRC,
  INTEREST_LIST_HREF,
} from "@/lib/enrollment";

// Applications are open only while NEXT_PUBLIC_APPLICATION_URL is set. With it
// unset, this page says applications are not open yet and sends families to
// the interest list, and search engines are told to leave it out.
const APPLICATIONS_OPEN = APPLICATION_URL !== null;

export const metadata: Metadata = APPLICATIONS_OPEN
  ? {
      title: "Apply",
      description:
        "Apply to Zenith College and Career Prep. Zenith is approved by the Arizona State Board for Charter Schools and enrolling 9th graders for August 2027.",
      alternates: { canonical: "/apply" },
    }
  : {
      title: "Applications",
      description:
        "Applications for Zenith College and Career Prep are not open yet. Join the interest list and we will tell you first.",
      alternates: { canonical: "/apply" },
      robots: { index: false, follow: true },
    };

/**
 * The application, embedded from Cognito Forms.
 *
 * The form lives at Cognito and is only shown here, so nothing a family types
 * passes through or is stored by this website. The privacy note, below the form,
 * says so and names the third party, because this page collects information about children.
 */
export default function ApplyPage() {
  if (!APPLICATIONS_OPEN) {
    return (
      <Section
        titleAs="h1"
        eyebrow="Applications"
        title="Applications are not open yet."
        description="Zenith College and Career Prep is approved to open in Maryvale in August 2027. We are not accepting applications yet. Join the interest list and we will tell you first when that changes."
        bg="white"
      >
        <Link
          href={INTEREST_LIST_HREF}
          className="inline-flex min-h-12 items-center rounded-full bg-midnight px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-midnight-75"
        >
          Join the interest list
        </Link>
      </Section>
    );
  }

  return (
    <>
      <Section
        titleAs="h1"
        eyebrow="Apply"
        title="Apply to Zenith."
        description="Zenith College and Career Prep is approved by the Arizona State Board for Charter Schools and enrolling 9th graders for August 2027. Complete the application below."
        bg="white"
        className="pb-8 md:pb-10"
      />

      <Section bg="ion-soft" className="pt-10 md:pt-14">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm text-midnight-75">
            Trouble seeing the form?{" "}
            <a
              href={COGNITO_PUBLIC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-eventide underline underline-offset-2 hover:text-midnight"
            >
              Open it in a new tab <ExternalLink size={13} aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <div className="overflow-hidden rounded-2xl border border-ion bg-white">
            <iframe
              src={COGNITO_EMBED_SRC}
              title="Zenith College and Career Prep application form"
              allow="payment"
              style={{ border: 0, width: "100%" }}
              height={2236}
            />
          </div>
          <noscript>
            <p className="mt-4 text-midnight">
              The form needs JavaScript. You can{" "}
              <a href={COGNITO_PUBLIC_URL} className="font-semibold underline">
                open the application on Cognito Forms
              </a>{" "}
              instead.
            </p>
          </noscript>
        </div>
      </Section>

      {/* Below the form, so the application comes first. */}
      <Section bg="white" className="py-10 md:py-14">
        <aside
          aria-labelledby="privacy-note-title"
          className="mx-auto max-w-4xl rounded-2xl border border-ion bg-ion-soft p-6 md:p-7"
        >
          <h2
            id="privacy-note-title"
            className="flex items-center gap-2 text-lg font-semibold text-midnight"
          >
            <ShieldCheck size={20} aria-hidden className="text-eventide" />
            How we handle your information
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-midnight leading-relaxed">
            <li>
              The application is a form from <strong className="font-semibold">Cognito Forms</strong>,
              a third-party service. What you enter is sent to Cognito Forms and received by Zenith.
              It is not stored in the Zenith website&apos;s own database.
            </li>
            <li>
              We use what you share to process enrollment at Zenith College and Career Prep.
            </li>
            <li>Share only what the form asks for.</li>
            <li>
              Read our full{" "}
              <Link
                href="/privacy"
                className="font-semibold text-eventide underline underline-offset-2 hover:text-midnight"
              >
                privacy page
              </Link>
              .
            </li>
            <li>
              Questions about the application or your information?{" "}
              <Link
                href="/contact"
                className="font-semibold text-eventide underline underline-offset-2 hover:text-midnight"
              >
                Contact us
              </Link>
              .
            </li>
          </ul>
        </aside>
      </Section>

      {/* Cognito's own script, which resizes the frame to fit the form. */}
      <Script src={COGNITO_SCRIPT_SRC} strategy="afterInteractive" />
    </>
  );
}
