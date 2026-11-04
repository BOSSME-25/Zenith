"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { inputClass, labelClass } from "@/components/forms/FormStatus";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [developer, setDeveloper] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPending(true);
        try {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: developer ? "" : email, password }),
          });
          const data = (await res.json().catch(() => null)) as
            | { ok?: boolean; message?: string; mustChangePassword?: boolean }
            | null;
          if (!res.ok || !data?.ok) {
            setError(data?.message || "Sign-in failed.");
            return;
          }
          // A temporary password has to be replaced before anything else.
          router.replace(data.mustChangePassword ? "/admin/account" : next);
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
    >
      {!developer && (
        <div>
          <label className={labelClass} htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      )}
      <div>
        <label className={labelClass} htmlFor="admin-password">
          {developer ? "Developer password" : "Password"}
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || password.length === 0 || (!developer && email.length === 0)}
        className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-midnight px-6 py-3 text-sm font-semibold text-white hover:bg-midnight-75 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
      <p className="text-center text-xs text-midnight-75">
        <button
          type="button"
          onClick={() => {
            setDeveloper((v) => !v);
            setError(null);
          }}
          className="inline-flex min-h-11 items-center font-semibold underline underline-offset-2 hover:text-midnight"
        >
          {developer ? "Sign in with my email instead" : "Developer sign-in"}
        </button>
      </p>
    </form>
  );
}
