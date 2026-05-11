"use client";

import { useActionState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "./FormStatus";
import { SubmitButton } from "./SubmitButton";

export function ContactForm() {
  const [state, action] = useActionState(submitContactForm, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-white border border-aurora p-8">
        <p className="eyebrow text-eventide">Message received</p>
        <p className="mt-3 text-xl font-semibold text-midnight">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="contact_name_input">Name <span aria-hidden className="text-red-600">*</span></label>
          <input id="contact_name_input" name="name" type="text" required className={inputClass} autoComplete="name" />
          <FieldError message={fe.name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact_email">Email <span aria-hidden className="text-red-600">*</span></label>
          <input id="contact_email" name="email" type="email" required className={inputClass} autoComplete="email" />
          <FieldError message={fe.email} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="subject">Subject <span aria-hidden className="text-red-600">*</span></label>
        <input id="subject" name="subject" type="text" required className={inputClass} />
        <FieldError message={fe.subject} />
      </div>
      <div>
        <label className={labelClass} htmlFor="message">Message <span aria-hidden className="text-red-600">*</span></label>
        <textarea id="message" name="message" rows={6} required className={inputClass} />
        <FieldError message={fe.message} />
      </div>
      <div>
        <SubmitButton label="Send Message" />
      </div>
      <FormStatus state={state} />
    </form>
  );
}
