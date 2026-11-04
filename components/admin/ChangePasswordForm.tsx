"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/app/actions/admin-users";
import { useKeptFormAction } from "@/lib/use-kept-form";
import { idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function ChangePasswordForm({
  landing,
  firstTime: firstTimeNow,
}: {
  landing: string;
  firstTime: boolean;
}) {
  const router = useRouter();
  // Saving the password refreshes the page, and the server then says this is
  // no longer a first-time change. Remember what it was when the form opened.
  const [firstTime] = useState(firstTimeNow);
  const { state, pending, onSubmit } = useKeptFormAction(changePassword, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  // Choosing a first password is the last step before the admin opens.
  useEffect(() => {
    if (state.status === "success" && firstTime) {
      const t = window.setTimeout(() => {
        router.replace(landing);
        router.refresh();
      }, 900);
      return () => window.clearTimeout(t);
    }
  }, [state.status, firstTime, landing, router]);

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label className={labelClass} htmlFor="current">
          {firstTime ? "Temporary password" : "Current password"}
        </label>
        <input id="current" name="current" type="password" autoComplete="current-password" className={inputClass} />
        <FieldError message={fe.current} />
      </div>
      <div>
        <label className={labelClass} htmlFor="next">New password</label>
        <input id="next" name="next" type="password" autoComplete="new-password" className={inputClass} />
        <p className="mt-1.5 text-xs text-midnight-75">
          At least 10 characters. A few words together is easy to remember and hard to guess.
        </p>
        <FieldError message={fe.next} />
      </div>
      <div>
        <label className={labelClass} htmlFor="confirm">Type the new password again</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" className={inputClass} />
        <FieldError message={fe.confirm} />
      </div>
      <SubmitButton
        label="Save my password"
        pendingLabel="Saving…"
        pending={pending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-midnight px-6 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75 transition-colors disabled:opacity-70"
      />
      <div role="status" aria-live="polite">
        <FormStatus state={state} />
      </div>
    </form>
  );
}
