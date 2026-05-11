import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminPasswordConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin Sign In" };

export default function AdminLoginPage() {
  const configured = adminPasswordConfigured();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-midnight text-white p-6">
      <div className="w-full max-w-md rounded-2xl bg-white text-midnight p-8 md:p-10 shadow-xl">
        <Logo variant="full-dark" width={220} height={64} className="h-14 w-auto mx-auto" href={null} />
        <h1 className="mt-7 text-2xl font-semibold text-center">Admin Sign In</h1>
        <p className="mt-2 text-sm text-midnight-75 text-center">
          Restricted to Zenith team members.
        </p>
        {!configured && (
          <div className="mt-6 rounded-md bg-ion-soft border border-ion px-4 py-3 text-sm text-midnight">
            ADMIN_PASSWORD is not configured. Set it in your environment to enable sign-in.
          </div>
        )}
        <div className="mt-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
