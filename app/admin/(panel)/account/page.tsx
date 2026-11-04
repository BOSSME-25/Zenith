import { accessOf, requireSession } from "@/lib/auth";
import { ROLE_LABELS, landingFor } from "@/lib/admin-access";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountPage() {
  // Open to anyone signed in, including someone who still has a temporary password.
  const session = await requireSession({ allowMustChange: true });

  if (session.kind === "owner") {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold text-midnight">My account</h1>
        <p className="text-midnight-75">
          You are signed in with the developer password. That password is set in the hosting
          settings as <code>ADMIN_PASSWORD</code>. Changing it there and redeploying signs every
          developer session out.
        </p>
      </div>
    );
  }

  const firstTime = session.mustChangePassword;
  return (
    <div className="max-w-xl space-y-6">
      <header>
        <p className="eyebrow text-eventide">{ROLE_LABELS[session.role]}</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">
          {firstTime ? "Choose your own password" : "My account"}
        </h1>
        <p className="mt-2 text-midnight-75">
          Signed in as <strong className="font-semibold text-midnight">{session.actor}</strong> ({session.email}).
        </p>
        {firstTime && (
          <p className="mt-3 rounded-xl border border-aurora bg-aurora-25 p-4 text-sm text-midnight">
            You signed in with a temporary password. Choose your own before you continue.
          </p>
        )}
      </header>
      <div className="rounded-2xl bg-white border border-ion p-6 md:p-8">
        <ChangePasswordForm landing={landingFor(accessOf(session))} firstTime={firstTime} />
      </div>
    </div>
  );
}
