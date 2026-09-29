"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { deleteCometProfile, publishComet, unpublishComet } from "@/app/actions/nomination";

export function CometPublishActions({
  id,
  published,
  consentOnFile,
}: {
  id: number;
  published: boolean;
  consentOnFile: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="text-right">
      <div className="inline-flex items-center gap-2">
        {published ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await unpublishComet(id);
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-ion px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-ion-soft disabled:opacity-60"
          >
            <EyeOff size={14} aria-hidden /> Unpublish
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending || !consentOnFile}
            title={consentOnFile ? undefined : "A signed consent release is required first."}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await publishComet(id);
                if (result.status === "error") setError(result.message);
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-aurora px-3 py-1.5 text-xs font-semibold text-white hover:bg-eventide disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye size={14} aria-hidden /> Publish
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!confirm("Delete this Comet profile permanently?")) return;
            startTransition(async () => {
              await deleteCometProfile(id);
            });
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          <Trash2 size={14} aria-hidden /> Delete
        </button>
      </div>
      {error && <p className="mt-2 max-w-xs text-xs text-red-600">{error}</p>}
    </div>
  );
}
