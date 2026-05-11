import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { adminPasswordConfigured, isAuthenticated } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/families", label: "Families" },
  { href: "/admin/community", label: "Community" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/surveys", label: "Surveys" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/updates", label: "Updates" },
];

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
  const passwordConfigured = adminPasswordConfigured();
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ion-soft">
      <aside className="md:w-64 md:min-h-screen md:sticky md:top-0 bg-midnight text-white px-5 py-6 md:py-8 flex flex-col">
        <Link href="/admin" className="inline-flex items-center" aria-label="Zenith Admin home">
          <Logo variant="wordmark-light" width={180} height={48} className="h-10 w-auto" href={null} />
        </Link>
        <p className="mt-1 text-xs tracking-[0.18em] uppercase text-ion">Admin</p>
        <nav aria-label="Admin sections" className="mt-8 flex flex-col gap-1">
          {NAV.map((l) => (
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
          {!passwordConfigured && (
            <p className="text-[11px] leading-relaxed text-ion/80 bg-midnight-75/40 rounded-md px-3 py-2">
              ADMIN_PASSWORD is not set. Login is disabled.
            </p>
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
