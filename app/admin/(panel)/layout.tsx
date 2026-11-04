import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { accessOf, getSession } from "@/lib/auth";
import { type Section, ROLE_LABELS, canAccess } from "@/lib/admin-access";

const NAV: Array<{ href: string; label: string; section: Section }> = [
  { href: "/admin", label: "Dashboard", section: "dashboard" },
  { href: "/admin/families", label: "Families", section: "families" },
  { href: "/admin/community", label: "Community", section: "community" },
  { href: "/admin/partners", label: "Partners", section: "partners" },
  { href: "/admin/contacts", label: "Contacts", section: "contacts" },
  { href: "/admin/newsletter", label: "Newsletter", section: "newsletter" },
  { href: "/admin/subscribers", label: "Subscribers", section: "subscribers" },
  { href: "/admin/updates", label: "Updates", section: "updates" },
  { href: "/admin/nominations", label: "Nominations", section: "nominations" },
  { href: "/admin/comets", label: "Comets", section: "comets" },
  { href: "/admin/meetings", label: "Meetings", section: "meetings" },
  { href: "/admin/feedback", label: "Feedback", section: "feedback" },
  { href: "/admin/settings", label: "Site settings", section: "settings" },
  { href: "/admin/users", label: "Logins", section: "users" },
];

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Each page and action checks access itself. This only decides what the
  // sidebar shows, and a first-time password change shows nothing else.
  const access = accessOf(session);
  const forcedChange = session.kind === "user" && session.mustChangePassword;
  const links = forcedChange ? [] : NAV.filter((l) => canAccess(access, l.section));
  const who = session.kind === "owner" ? "Developer" : session.actor;
  const roleLabel = session.kind === "owner" ? "Full access" : ROLE_LABELS[session.role];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ion-soft">
      <aside className="md:w-64 md:min-h-screen md:sticky md:top-0 bg-midnight text-white px-5 py-6 md:py-8 flex flex-col">
        <Link href="/admin" className="inline-flex items-center" aria-label="Zenith Admin home">
          <Logo variant="wordmark-light" width={180} height={48} className="h-10 w-auto" href={null} />
        </Link>
        <p className="mt-1 text-xs tracking-[0.18em] uppercase text-ion">Admin</p>
        <nav aria-label="Admin sections" className="mt-8 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:bg-midnight-75/40 hover:text-ion"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6 flex flex-col gap-3">
          <div className="rounded-md bg-midnight-75/40 px-3 py-2">
            <p className="text-xs text-white/70">Signed in as</p>
            <p className="text-sm font-semibold text-white break-words">{who}</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ion">{roleLabel}</p>
          </div>
          {!forcedChange && (
            <Link href="/admin/account" className="text-xs text-white/70 hover:text-ion">
              My account
            </Link>
          )}
          <Link href="/" className="text-xs text-white/70 hover:text-ion">
            ← Back to website
          </Link>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
