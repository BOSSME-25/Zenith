"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await fetch("/api/admin/logout", { method: "POST" });
          router.replace("/admin/login");
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
      className="inline-flex items-center gap-2 rounded-md border border-ion/30 px-3 py-2 text-xs font-semibold text-ion hover:bg-midnight-75/30 disabled:opacity-60"
    >
      <LogOut size={14} aria-hidden /> {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
