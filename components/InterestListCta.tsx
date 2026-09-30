"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/cn";

const DISMISS_KEY = "zenith-interest-cta-dismissed";
/** Far enough down that it never competes with a page's own hero CTA. */
const SHOW_AFTER_PX = 420;

/**
 * Floating "Join the Interest List" CTA, present on every public page.
 *
 * Deliberately not an automatic modal: the site already opens a welcome video
 * dialog, and a second interstitial would both stack on top of it and risk
 * Google's intrusive-interstitial penalty on mobile, which would work against
 * the SEO work. This slides in on scroll instead, and can be dismissed for the
 * rest of the session.
 */
export function InterestListCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume hidden until checked

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false); // storage blocked — still show it
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pointless on the page it links to, and on the nomination form.
  if (pathname.startsWith("/get-involved") || pathname.startsWith("/alumni/nominate")) return null;
  if (dismissed) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-40 flex items-center gap-1 transition-all duration-300 sm:bottom-6 sm:right-6",
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3",
      )}
    >
      <Link
        href="/get-involved#family"
        className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(6,36,63,0.35)] ring-1 ring-ion/30 transition-colors hover:bg-eventide active:scale-95"
      >
        Join the Interest List
        <ArrowRight size={16} aria-hidden />
      </Link>
      <button
        type="button"
        aria-label="Hide the interest list button"
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            // Non-fatal: it simply reappears on the next page load.
          }
        }}
        className="grid h-8 w-8 flex-none place-items-center rounded-full bg-midnight/90 text-white/80 ring-1 ring-ion/30 transition-colors hover:bg-midnight hover:text-white"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}
