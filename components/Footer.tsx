import Link from "next/link";
import { Logo } from "./Logo";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const FOOTER_LINKS = [
  { href: "/our-story", label: "Our Story" },
  { href: "/our-board", label: "Our Board" },
  { href: "/faq", label: "FAQ" },
  { href: "/updates", label: "Updates" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/contact", label: "Contact" },
];

const SOCIALS = [
  {
    href: "https://www.instagram.com/zenithcollegeandcareerprep",
    label: "Follow Zenith on Instagram",
    handle: "@zenithcollegeandcareerprep",
    icon: InstagramIcon,
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-midnight text-white">
      <div className="container-prose py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
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
          <div>
            <p className="eyebrow text-ion">Follow Us</p>
            <p className="mt-4 text-sm text-white/85 leading-relaxed">
              Follow along for community updates, behind-the-scenes moments, and ways to get involved.
            </p>
            <ul className="mt-5 space-y-3">
              {SOCIALS.map(({ href, label, handle, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group inline-flex items-center gap-3 text-sm text-white/85 hover:text-ion"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-midnight-75/40 ring-1 ring-ion/30 transition-colors group-hover:bg-ion group-hover:text-midnight">
                      <Icon size={18} />
                    </span>
                    <span className="font-medium">{handle}</span>
                  </Link>
                </li>
              ))}
            </ul>
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
