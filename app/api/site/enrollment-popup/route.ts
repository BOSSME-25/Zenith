import { NextResponse } from "next/server";
import { getEnrollmentPopup } from "@/lib/meetings";

export const dynamic = "force-dynamic";

/**
 * What the site-wide pop-up should show right now, or nothing.
 *
 * The pop-up is fetched by the browser rather than read in the root layout, so
 * that reading a setting does not turn every page on the site into a
 * database-backed dynamic page. With the state hidden (the default) the answer
 * is empty and the page renders no pop-up markup at all.
 */
export async function GET() {
  const popup = await getEnrollmentPopup();
  const now = Date.now();
  const live =
    (popup.state === "coming_soon" || popup.state === "open") &&
    (!popup.showFrom || new Date(popup.showFrom).getTime() <= now) &&
    (!popup.showUntil || new Date(popup.showUntil).getTime() > now);

  return NextResponse.json(
    {
      popup: live
        ? {
            state: popup.state,
            eyebrow: popup.eyebrow,
            headline: popup.headline,
            body: popup.body,
            ctaLabel: popup.ctaLabel,
            ctaUrl: popup.ctaUrl || (popup.state === "coming_soon" ? "/get-involved#family" : null),
            secondaryLabel: popup.secondaryLabel || null,
            secondaryUrl: popup.secondaryLabel ? popup.secondaryUrl || null : null,
            imageUrl: popup.imageUrl || null,
            imageAlt: popup.imageAlt,
            rememberDismissDays: popup.rememberDismissDays,
            // Changing the copy or the image counts as a new pop-up, so a
            // visitor who closed the old one sees the new one.
            version: [popup.state, popup.headline, popup.body, popup.ctaUrl, popup.secondaryUrl, popup.imageUrl].join("|"),
          }
        : null,
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
  );
}
