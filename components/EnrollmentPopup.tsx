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
const EXCLUDED = ["/get-involved", "/apply", "/admin"];

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
  wide = false,
  children,
}: {
  href: string;
  onFollow: () => void;
  primary?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  const className = primary
    ? cn(
        "inline-flex min-h-12 items-center justify-center rounded-full bg-aurora px-8 py-3 text-base font-semibold text-midnight transition-colors hover:bg-aurora-75",
        wide && "w-full max-w-xs",
      )
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
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto overflow-x-hidden rounded-2xl border-0 bg-midnight p-0 text-white shadow-2xl",
        "backdrop:bg-midnight/70",
        "motion-safe:animate-[zenith-fade_200ms_ease-out]",
        hasImage ? "max-w-3xl" : "max-w-lg",
      )}
    >
      <div
        className={cn(
          "relative grid overflow-hidden rounded-2xl",
          hasImage ? "md:grid-cols-2" : "comet-trail",
        )}
      >
        {!hasImage && (
          // Without a photo the pop-up carries its own look: a soft glow in the
          // lower corner, kept well away from the logo and the small text.
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-eventide/40 blur-3xl"
          />
        )}
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
        <div
          className={cn(
            "relative flex flex-col",
            hasImage ? "p-7 md:p-9" : "items-center px-7 pb-8 pt-9 text-center md:px-12 md:pb-10 md:pt-11",
          )}
        >
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"
          >
            <X size={20} aria-hidden />
          </button>

          {!hasImage && (
            <Image
              src="/brand/zenith-shield-light.png"
              alt="Zenith College and Career Prep"
              width={120}
              height={72}
              className="h-16 w-auto"
              priority
            />
          )}

          <p
            className={cn(
              "eyebrow text-ion",
              hasImage
                ? "pr-10"
                : "mt-6 rounded-full border border-ion/30 bg-white/5 px-4 py-1.5 text-[0.7rem]",
            )}
          >
            {popup.eyebrow}
          </p>
          <h2
            id="enrollment-popup-title"
            className={cn(
              "text-balance font-bold leading-tight text-white",
              hasImage ? "mt-3 text-2xl md:text-3xl" : "mt-5 text-3xl md:text-4xl",
            )}
          >
            {popup.headline}
          </h2>
          <p
            id="enrollment-popup-body"
            className={cn("leading-relaxed text-white", hasImage ? "mt-4" : "mt-4 max-w-md md:text-lg")}
          >
            {popup.body}
          </p>

          <div
            className={cn(
              "flex flex-col gap-1",
              hasImage ? "mt-7 items-start" : "mt-8 w-full items-center",
            )}
          >
            {popup.ctaUrl && (
              <PopupLink href={popup.ctaUrl} onFollow={dismiss} primary wide={!hasImage}>
                {popup.ctaLabel}
              </PopupLink>
            )}
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

          {hasImage && (
            <div className="mt-auto pt-8">
              <Image
                src="/brand/zenith-shield-light.png"
                alt="Zenith College and Career Prep"
                width={120}
                height={72}
                className="h-14 w-auto"
              />
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
