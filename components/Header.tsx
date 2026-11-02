"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

/** Pages about the school itself, grouped so the bar stays on one line. */
const ABOUT = [
  { href: "/our-story", label: "Our Story" },
  { href: "/school-model", label: "School Model" },
  { href: "/our-board", label: "Our Board" },
  { href: "/public-meetings", label: "Public Meetings" },
];

const NAV = [
  { href: "/faq", label: "FAQ" },
  { href: "/updates", label: "Updates" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/alumni", label: "Comets" },
  { href: "/contact", label: "Contact" },
];

const isActive = (pathname: string | null, href: string) =>
  pathname === href || (href !== "/" && Boolean(pathname?.startsWith(href)));

/**
 * The About group. A disclosure rather than a hover menu, so it works with a
 * keyboard and on touch: the button toggles the list, Escape closes it and
 * returns focus to the button, and so does moving focus or clicking away.
 */
function AboutMenu({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = ABOUT.some((i) => isActive(pathname, i.href));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="about-menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative inline-flex items-center gap-1 text-sm font-medium tracking-wide transition-colors",
          active
            ? "text-ion after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[2px] after:rounded-full after:bg-aurora"
            : "text-white/85 hover:text-ion",
        )}
      >
        About
        <ChevronDown size={14} aria-hidden className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          id="about-menu"
          className="absolute left-0 top-full z-50 mt-4 w-56 rounded-xl border border-midnight-75/40 bg-midnight p-2 shadow-xl"
        >
          {ABOUT.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium",
                  isActive(pathname, item.href)
                    ? "bg-midnight-75/40 text-ion"
                    : "text-white/90 hover:bg-midnight-75/30 hover:text-ion",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onAdmin = pathname?.startsWith("/admin");
  if (onAdmin) return null;

  return (
    <header className="sticky top-0 z-40 bg-midnight text-white border-b border-midnight-75/40">
      <div className="container-prose flex items-center justify-between gap-8 py-3 md:py-4">
        <Link
          href="/"
          aria-label="Zenith College & Career Prep, home"
          className="inline-flex shrink-0 items-baseline gap-2 whitespace-nowrap"
        >
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white">Zenith</span>{" "}
          <span className="hidden sm:inline text-xs md:text-sm font-medium uppercase tracking-[0.18em] text-ion">
            College &amp; Career Prep
          </span>
        </Link>
        <nav className="hidden min-[1080px]:flex items-center gap-7 whitespace-nowrap" aria-label="Primary">
          <AboutMenu pathname={pathname} />
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative text-sm font-medium tracking-wide transition-colors",
                  active
                    ? "text-ion after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[2px] after:rounded-full after:bg-aurora"
                    : "text-white/85 hover:text-ion",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/get-involved"
            className="ml-2 inline-flex items-center rounded-full bg-ion px-5 py-2 text-sm font-semibold text-midnight transition-colors hover:bg-white"
          >
            Get Involved
          </Link>
        </nav>
        <button
          type="button"
          className="min-[1080px]:hidden inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-midnight-75/30"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "min-[1080px]:hidden bg-midnight border-t border-midnight-75/30 transition-[max-height,opacity] duration-200 overflow-hidden",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        )}
        aria-hidden={!open}
      >
        <nav className="container-prose py-4 flex flex-col gap-1" aria-label="Mobile">
          {[...ABOUT, ...NAV].map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-3 text-base font-medium",
                  active ? "bg-midnight-75/40 text-ion" : "text-white/90 hover:bg-midnight-75/30",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/get-involved"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-ion px-5 py-3 text-base font-semibold text-midnight"
          >
            Get Involved
          </Link>
        </nav>
      </div>
    </header>
  );
}
