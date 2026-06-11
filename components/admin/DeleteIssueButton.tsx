"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteIssue } from "@/app/actions/newsletter-issue";

export function DeleteIssueButton({ id, label }: { id: number; label: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
        startTransition(async () => {
          await deleteIssue(id);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
    >
      <Trash2 size={14} aria-hidden /> Delete
    </button>
  );
}
