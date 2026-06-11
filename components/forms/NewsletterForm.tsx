"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "./FormStatus";
import { SubmitButton } from "./SubmitButton";

export function NewsletterForm() {
  const [state, action] = useActionState(subscribeNewsletter, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-white border border-aurora p-8 text-left">
        <p className="eyebrow text-eventide">You&apos;re subscribed</p>
        <p className="mt-3 text-xl font-semibold text-midnight">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 text-left" noValidate>
      <div>
        <label className={labelClass} htmlFor="newsletter_name">
          Name <span className="font-normal text-midnight-50">(optional)</span>
        </label>
        <input
          id="newsletter_name"
          name="name"
          type="text"
          className={inputClass}
          autoComplete="name"
        />
        <FieldError message={fe.name} />
      </div>
      <div>
        <label className={labelClass} htmlFor="newsletter_email">
          Email <span aria-hidden className="text-red-600">*</span>
        </label>
        <input
          id="newsletter_email"
          name="email"
          type="email"
          required
          className={inputClass}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FieldError message={fe.email} />
      </div>
      <div>
        <SubmitButton label="Notify Me" pendingLabel="Signing up…" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-midnight px-7 py-3 text-sm md:text-base font-semibold text-white hover:bg-midnight-75 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" />
      </div>
      <p className="text-xs text-midnight-50">
        We&apos;ll only use your email for the Zenith newsletter. No spam, unsubscribe anytime.
      </p>
      <FormStatus state={state} />
    </form>
  );
}
