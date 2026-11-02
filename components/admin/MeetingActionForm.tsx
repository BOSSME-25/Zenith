"use client";

import { useId, type FormEvent, type ReactNode } from "react";
import { useKeptFormAction } from "@/lib/use-kept-form";
import { type ActionState, idleState } from "@/lib/validators";
import { FormStatus } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PostedBySelect } from "./PostedBySelect";

const PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-6 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-h-11";
const DANGER =
  "inline-flex items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-6 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-h-11";

/**
 * One small form for each step in a meeting's life: publish, cancel, move,
 * withdraw a file. Each names who is acting and shows what the server said.
 */
export function MeetingActionForm({
  action,
  hidden,
  posters,
  submitLabel,
  pendingLabel,
  tone = "primary",
  confirmText,
  children,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  hidden: Record<string, string>;
  posters: string[];
  submitLabel: string;
  pendingLabel?: string;
  tone?: "primary" | "danger";
  confirmText?: string;
  children?: ReactNode;
}) {
  const { state, pending, onSubmit } = useKeptFormAction(action, idleState);
  const uid = useId();

  function handle(e: FormEvent<HTMLFormElement>) {
    if (confirmText && !window.confirm(confirmText)) {
      e.preventDefault();
      return;
    }
    onSubmit(e);
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {children}
      <PostedBySelect posters={posters} id={`posted_by_${uid}`} />
      <SubmitButton
        label={submitLabel}
        pendingLabel={pendingLabel ?? "Working…"}
        pending={pending}
        className={tone === "danger" ? DANGER : PRIMARY}
      />
      <div role="status" aria-live="polite">
        <FormStatus state={state} />
      </div>
    </form>
  );
}
