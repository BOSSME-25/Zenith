"use client";

import { useActionState } from "react";
import { submitPartnerForm } from "@/app/actions/partner";
import { PARTNER_INTERESTS, idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "./FormStatus";
import { SubmitButton } from "./SubmitButton";

export function PartnerForm() {
  const [state, action] = useActionState(submitPartnerForm, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-white border border-aurora p-8">
        <p className="eyebrow text-eventide">Thank you</p>
        <p className="mt-3 text-xl font-semibold text-midnight">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="organization">Organization <span aria-hidden className="text-red-600">*</span></label>
          <input id="organization" name="organization" type="text" required className={inputClass} autoComplete="organization" />
          <FieldError message={fe.organization} />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact_name">Contact name <span aria-hidden className="text-red-600">*</span></label>
          <input id="contact_name" name="contact_name" type="text" required className={inputClass} autoComplete="name" />
          <FieldError message={fe.contact_name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="partner_email">Email <span aria-hidden className="text-red-600">*</span></label>
          <input id="partner_email" name="email" type="email" required className={inputClass} autoComplete="email" />
          <FieldError message={fe.email} />
        </div>
        <div>
          <label className={labelClass} htmlFor="partner_phone">Phone</label>
          <input id="partner_phone" name="phone" type="tel" className={inputClass} autoComplete="tel" />
          <FieldError message={fe.phone} />
        </div>
      </div>
      <fieldset>
        <legend className={labelClass}>Partnership interest <span aria-hidden className="text-red-600">*</span></legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PARTNER_INTERESTS.map((i) => (
            <label key={i} className="flex items-center gap-2 rounded-lg border border-ion bg-white px-3 py-2 cursor-pointer hover:border-eventide">
              <input type="checkbox" name="interests" value={i} className="accent-midnight" />
              <span className="text-sm text-midnight">{i}</span>
            </label>
          ))}
        </div>
        <FieldError message={fe.interests} />
      </fieldset>
      <div>
        <label className={labelClass} htmlFor="description">Brief description <span aria-hidden className="text-red-600">*</span></label>
        <textarea id="description" name="description" rows={5} required className={inputClass} placeholder="Tell us a bit about your organization and how you'd like to partner with Zenith." />
        <FieldError message={fe.description} />
      </div>
      <div>
        <SubmitButton label="Submit Inquiry" />
      </div>
      <FormStatus state={state} />
    </form>
  );
}
