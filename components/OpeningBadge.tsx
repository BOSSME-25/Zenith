"use client";

import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";

/**
 * Slim "Opening Fall 2027" band shown under the header on every page.
 *
 * Skipped on the homepage, where the hero already carries the same facts in a
 * much larger callout — stacking the two immediately on top of each other reads
 * as a duplication bug rather than emphasis.
 */
export function OpeningBadge() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="bg-ion-soft border-b border-ion">
      <div className="container-prose flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 py-2.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-midnight px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          <CalendarDays size={13} aria-hidden className="text-ion" />
          Opening Fall 2027
        </span>
        <span className="text-sm text-midnight-75">
          Founding 9th grade class · Tuition-free public charter
        </span>
      </div>
    </div>
  );
}
