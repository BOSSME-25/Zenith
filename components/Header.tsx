"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/our-story", label: "Our Story" },
  { href: "/school-model", label: "School Model" },
  { href: "/our-board", label: "Our Board" },
  { href: "/faq", label: "FAQ" },
  { href: "/updates", label: "Updates" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/contact", label: "Contact" },
];

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
      <div className="container-prose flex items-center justify-between py-3 md:py-4">
        <Link
          href="/"
          aria-label="Zenith College and Career Prep — home"
          className="inline-flex items-baseline gap-2 whitespace-nowrap"
        >
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white">Zenith</span>
          <span className="hidden sm:inline text-xs md:text-sm font-medium uppercase tracking-[0.18em] text-ion">
            College &amp; Career Prep
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
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
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-midnight-75/30"
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
          "md:hidden bg-midnight border-t border-midnight-75/30 transition-[max-height,opacity] duration-200 overflow-hidden",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        )}
        aria-hidden={!open}
      >
        <nav className="container-prose py-4 flex flex-col gap-1" aria-label="Mobile">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
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
