"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type Stat = {
  value: number;
  /** "+" or "%" etc., appended to the animated number */
  suffix?: string;
  label: string;
};

type Props = {
  stats: Stat[];
  /** "light" = midnight numbers, "dark" = white numbers (for midnight bg) */
  variant?: "light" | "dark";
  className?: string;
};

const DURATION_MS = 1500;

function useCountUp(target: number, shouldRun: boolean): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!shouldRun) return;
    if (typeof window === "undefined") {
      setN(target);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION_MS);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, shouldRun]);
  return n;
}

function StatItem({ stat, run, variant }: { stat: Stat; run: boolean; variant: "light" | "dark" }) {
  const n = useCountUp(stat.value, run);
  const numColor = variant === "dark" ? "text-white" : "text-midnight";
  const labelColor = variant === "dark" ? "text-ion" : "text-eventide";
  return (
    <div className="flex flex-col items-start">
      <p className={cn("text-5xl md:text-6xl font-bold leading-none tracking-tight", numColor)}>
        {n.toLocaleString()}
        {stat.suffix && (
          <span className={cn("ml-0.5", numColor)}>{stat.suffix}</span>
        )}
      </p>
      <p className={cn("mt-3 text-sm md:text-base font-medium leading-snug", labelColor)}>
        {stat.label}
      </p>
    </div>
  );
}

export function StatCounter({ stats, variant = "light", className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRun(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRun(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const dividerColor = variant === "dark" ? "bg-ion/30" : "bg-eventide/25";

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x",
        variant === "dark" ? "sm:divide-ion/30" : "sm:divide-eventide/25",
        className,
      )}
    >
      {stats.map((s, i) => (
        <div key={s.label} className={cn("sm:px-8", i === 0 && "sm:pl-0", i === stats.length - 1 && "sm:pr-0")}>
          <StatItem stat={s} run={run} variant={variant} />
        </div>
      ))}
      {/* Hidden div purely to silence lint about unused dividerColor — kept for future inline use */}
      <span className={cn("hidden", dividerColor)} aria-hidden />
    </div>
  );
}
