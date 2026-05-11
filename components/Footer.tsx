import Link from "next/link";
import { Logo } from "./Logo";

const FOOTER_LINKS = [
  { href: "/our-story", label: "Our Story" },
  { href: "/our-board", label: "Our Board" },
  { href: "/faq", label: "FAQ" },
  { href: "/updates", label: "Updates" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-midnight text-white">
      <div className="container-prose py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo variant="full-light" width={220} height={64} className="h-14 w-auto" />
            <p className="mt-5 text-sm leading-relaxed text-white/75 max-w-xs">
              An early college STEAM high school designed with the Maryvale community of Phoenix.
              Currently in the application phase with the Arizona State Board for Charter Schools.
            </p>
          </div>
          <div>
            <p className="eyebrow text-ion">Explore</p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/85 hover:text-ion">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-ion">Stay Connected</p>
            <p className="mt-4 text-sm text-white/85 leading-relaxed">
              Want to stay informed as Zenith progresses through charter authorization?
            </p>
            <Link
              href="/get-involved#family"
              className="mt-5 inline-flex items-center rounded-full bg-ion px-5 py-2.5 text-sm font-semibold text-midnight hover:bg-white"
            >
              Join the Interest List
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-midnight-75/40 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs tracking-[0.18em] uppercase text-ion">Elevating Every Future</p>
          <p className="text-xs text-white/60">
            &copy; {year} Zenith College and Career Prep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
