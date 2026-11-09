"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type Popup = {
  state: "coming_soon" | "open";
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string | null;
  secondaryLabel: string | null;
  secondaryUrl: string | null;
  imageUrl: string | null;
  imageAlt: string;
  rememberDismissDays: number;
  version: string;
};

const SESSION_KEY = "zenith-enrollment-popup-shown";
const DISMISS_KEY = "zenith-enrollment-popup-dismissed";
const DELAY_MS = 1500;

/** Pages where the pop-up would only repeat what the visitor is already doing. */
const EXCLUDED = ["/get-involved", "/admin"];

function dismissedRecently(version: string): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw) as { until: number; version: string };
    return saved.version === version && saved.until > Date.now();
  } catch {
    return false;
  }
}

/**
 * A link inside the pop-up: the main button, or a smaller text link. An
 * outside address (the application) opens in a new tab so the visitor keeps
 * their place on the site.
 */
function PopupLink({
  href,
  onFollow,
  primary = false,
  children,
}: {
  href: string;
  onFollow: () => void;
  primary?: boolean;
  children: React.ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  const className = primary
    ? "inline-flex min-h-11 items-center justify-center rounded-full bg-aurora px-7 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-aurora-75 transition-colors"
    : "inline-flex min-h-11 items-center px-1 text-sm font-semibold text-white underline underline-offset-4 hover:text-ion";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onFollow} className={className}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} onClick={onFollow} className={className}>
      {children}
    </Link>
  );
}

/**
 * The site-wide enrollment pop-up.
 *
 * Off by default: with no live setting this renders nothing at all. When on,
 * it appears once per visit, about a second and a half after the page loads.
 * It uses the native dialog
 * element, so focus stays inside it, Escape closes it, and focus returns to
 * where the visitor was. It collects nothing.
 */
export function EnrollmentPopup() {
  const pathname = usePathname();
  const [popup, setPopup] = useState<Popup | null>(null);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const excluded = EXCLUDED.some((p) => pathname?.startsWith(p));

  // Ask the server what, if anything, to show.
  useEffect(() => {
    if (excluded) return;
    let cancelled = false;
    fetch("/api/site/enrollment-popup")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { popup: Popup | null } | null) => {
        if (!cancelled && data?.popup) setPopup(data.popup);
      })
      .catch(() => {
        // The site works the same without it.
      });
    return () => {
      cancelled = true;
    };
  }, [excluded]);

  // Decide when to show it.
  useEffect(() => {
    if (!popup || excluded) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      // Storage blocked: fall through and show it once for this page view.
    }
    if (dismissedRecently(popup.version)) return;

    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
      setOpen(true);
    }, DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [popup, excluded]);

  // Open the native dialog and keep the page behind it still.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!popup || !open || excluded) return null;

  /** Closing it, or following either link, keeps it away for the set number of days. */
  function rememberDismissal() {
    try {
      localStorage.setItem(
        DISMISS_KEY,
        JSON.stringify({
          until: Date.now() + (popup?.rememberDismissDays ?? 7) * 24 * 60 * 60 * 1000,
          version: popup?.version,
        }),
      );
    } catch {
      // ignore
    }
  }

  function dismiss() {
    rememberDismissal();
    setOpen(false);
  }

  const hasImage = Boolean(popup.imageUrl);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="enrollment-popup-title"
      aria-describedby="enrollment-popup-body"
      onClose={dismiss}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border-0 bg-midnight p-0 text-white shadow-2xl",
        "backdrop:bg-midnight/70",
        "motion-safe:animate-[zenith-fade_200ms_ease-out]",
        hasImage ? "max-w-3xl" : "max-w-lg",
      )}
    >
      <div className={cn("grid", hasImage && "md:grid-cols-2")}>
        {hasImage && (
          // The photo carries no logo and no text. Plain img: it may live on
          // any approved host, and next/image would need each one allowed.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={popup.imageUrl as string}
            alt={popup.imageAlt}
            className="h-44 w-full object-cover md:h-full md:min-h-[26rem]"
          />
        )}
        <div className="relative flex flex-col p-7 md:p-9">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"
          >
            <X size={20} aria-hidden />
          </button>

          <p className="eyebrow pr-10 text-ion">{popup.eyebrow}</p>
          <h2 id="enrollment-popup-title" className="mt-3 text-2xl md:text-3xl font-bold leading-tight text-white">
            {popup.headline}
          </h2>
          <p id="enrollment-popup-body" className="mt-4 leading-relaxed text-white">
            {popup.body}
          </p>

          <div className="mt-7 flex flex-col items-start gap-2">
            {popup.ctaUrl && <PopupLink href={popup.ctaUrl} onFollow={dismiss} primary>{popup.ctaLabel}</PopupLink>}
            {popup.secondaryLabel && popup.secondaryUrl && (
              <PopupLink href={popup.secondaryUrl} onFollow={dismiss}>
                {popup.secondaryLabel}
              </PopupLink>
            )}
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-white/90 underline underline-offset-4 hover:text-white"
            >
              Maybe later
            </button>
          </div>

          <div className="mt-auto pt-8">
            <Image
              src="/brand/zenith-shield-light.png"
              alt="Zenith College and Career Prep"
              width={120}
              height={72}
              className="h-14 w-auto"
            />
          </div>
        </div>
      </div>
    </dialog>
  );
}
