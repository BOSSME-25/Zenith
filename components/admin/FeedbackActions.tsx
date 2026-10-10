"use client";

import { useTransition } from "react";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { deleteFeedback, setFeedbackStatus } from "@/app/actions/feedback";

export function FeedbackActions({ id, status }: { id: number; status: string }) {
  const [isPending, startTransition] = useTransition();
  const done = status === "done";

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => setFeedbackStatus(id, done ? "new" : "done"))}
        className={
          done
            ? "inline-flex items-center gap-1.5 rounded-md border border-ion px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-ion-soft disabled:opacity-60"
            : "inline-flex items-center gap-1.5 rounded-md bg-aurora px-3 py-1.5 text-xs font-semibold text-white hover:bg-eventide disabled:opacity-60"
        }
      >
        {done ? <RotateCcw size={14} aria-hidden /> : <Check size={14} aria-hidden />}
        {done ? "Reopen" : "Mark done"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Delete this feedback permanently?")) return;
          startTransition(async () => deleteFeedback(id));
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        <Trash2 size={14} aria-hidden /> Delete
      </button>
    </div>
  );
}
