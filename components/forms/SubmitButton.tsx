"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type Props = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({ label, pendingLabel, className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-7 py-3 text-sm md:text-base font-semibold text-white hover:bg-midnight-75 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      }
    >
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin" aria-hidden />
          {pendingLabel || "Submitting…"}
        </>
      ) : (
        label
      )}
    </button>
  );
}
