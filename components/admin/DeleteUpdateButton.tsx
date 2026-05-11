"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteUpdate } from "@/app/actions/update";

export function DeleteUpdateButton({ id, title }: { id: number; title: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        startTransition(async () => {
          await deleteUpdate(id);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
    >
      <Trash2 size={14} aria-hidden /> Delete
    </button>
  );
}
