"use client";

import { useState, useTransition } from "react";
import { Check, Trash2, X } from "lucide-react";
import { approveNomination, deleteNomination, rejectNomination } from "@/app/actions/nomination";

export function NominationActions({ id, status }: { id: number; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (status !== "pending") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Delete this nomination permanently?")) return;
          startTransition(async () => {
            await deleteNomination(id);
          });
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        <Trash2 size={14} aria-hidden /> Delete
      </button>
    );
  }

  if (rejecting) {
    return (
      <div className="text-left">
        <label className="block text-xs font-semibold text-midnight mb-1" htmlFor={`reason_${id}`}>
          Reason for rejecting (kept internal)
        </label>
        <textarea
          id={`reason_${id}`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-ion bg-white px-3 py-2 text-sm text-midnight focus:border-eventide focus:outline-none focus:ring-2 focus:ring-eventide/40"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await rejectNomination(id, reason);
                if (result.status === "error") setError(result.message);
                else setRejecting(false);
              });
            }}
            className="rounded-md bg-midnight px-3 py-1.5 text-xs font-semibold text-white hover:bg-midnight-75 disabled:opacity-60"
          >
            Confirm rejection
          </button>
          <button
            type="button"
            onClick={() => {
              setRejecting(false);
              setError(null);
            }}
            className="rounded-md border border-ion px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-ion-soft"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Approve this nomination? It creates an unpublished draft profile.")) return;
          startTransition(async () => {
            await approveNomination(id);
          });
        }}
        className="inline-flex items-center gap-1.5 rounded-md bg-aurora px-3 py-1.5 text-xs font-semibold text-white hover:bg-eventide disabled:opacity-60"
      >
        <Check size={14} aria-hidden /> Approve
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setRejecting(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-ion px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-ion-soft disabled:opacity-60"
      >
        <X size={14} aria-hidden /> Reject
      </button>
    </div>
  );
}
