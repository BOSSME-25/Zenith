import Link from "next/link";
import { ArrowRight, PartyPopper } from "lucide-react";

/**
 * The congratulations banner at the top of the homepage. Other pages carry the
 * same news in the slim band under the header (see OpeningBadge), so the news
 * is never more than one glance away.
 *
 * It points at the interest list, because the details on how to enroll are
 * not out yet. When they are, this is the place to point at the application.
 */
export function ApprovalBanner() {
  return (
    <aside aria-label="Charter approval" className="bg-aurora text-midnight">
      <div className="container-prose flex flex-col items-center gap-3 py-4 text-center md:flex-row md:justify-center md:gap-6 md:text-left">
        <p className="flex items-start gap-3 md:items-center">
          <PartyPopper size={26} aria-hidden className="mt-0.5 flex-none md:mt-0" />
          <span className="text-base md:text-lg leading-snug">
            <strong className="font-bold">We&apos;re approved!</strong> The Arizona State Board for
            Charter Schools has approved Zenith College and Career Prep. We&apos;re enrolling 9th
            graders for August 2027.
          </span>
        </p>
        <Link
          href="/get-involved#family"
          className="inline-flex min-h-11 flex-none items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75 transition-colors"
        >
          Join the interest list <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
