"use client";

import { useActionState, useState } from "react";
import { submitCommunityForm } from "@/app/actions/community";
import { COMMUNITY_INTERESTS, COMMUNITY_ROLES, idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "./FormStatus";
import { SubmitButton } from "./SubmitButton";

export function CommunityForm() {
  const [state, action] = useActionState(submitCommunityForm, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};
  const [otherChecked, setOtherChecked] = useState(false);

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
          <label className={labelClass} htmlFor="community_name">Name <span aria-hidden className="text-red-600">*</span></label>
          <input id="community_name" name="name" type="text" required className={inputClass} autoComplete="name" />
          <FieldError message={fe.name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="community_email">Email <span aria-hidden className="text-red-600">*</span></label>
          <input id="community_email" name="email" type="email" required className={inputClass} autoComplete="email" />
          <FieldError message={fe.email} />
        </div>
        <div>
          <label className={labelClass} htmlFor="community_zip">Zip code <span aria-hidden className="text-red-600">*</span></label>
          <input id="community_zip" name="zip_code" type="text" required inputMode="numeric" pattern="\d{5}" maxLength={5} className={inputClass} autoComplete="postal-code" />
          <FieldError message={fe.zip_code} />
        </div>
      </div>
      <fieldset>
        <legend className={labelClass}>Role <span aria-hidden className="text-red-600">*</span></legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {COMMUNITY_ROLES.map((r) => (
            <label key={r} className="flex items-center gap-2 rounded-lg border border-ion bg-white px-3 py-2 cursor-pointer hover:border-eventide">
              <input
                type="checkbox"
                name="roles"
                value={r}
                className="accent-midnight"
                onChange={r === "Other" ? (e) => setOtherChecked(e.currentTarget.checked) : undefined}
              />
              <span className="text-sm text-midnight">{r}</span>
            </label>
          ))}
        </div>
        <FieldError message={fe.roles} />
      </fieldset>
      {otherChecked && (
        <div>
          <label className={labelClass} htmlFor="other_role">Tell us more about your role</label>
          <textarea id="other_role" name="other_role" rows={2} className={inputClass} />
          <FieldError message={fe.other_role} />
        </div>
      )}
      <fieldset>
        <legend className={labelClass}>Interested in</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {COMMUNITY_INTERESTS.map((i) => (
            <label key={i} className="flex items-center gap-2 rounded-lg border border-ion bg-white px-3 py-2 cursor-pointer hover:border-eventide">
              <input type="checkbox" name="interests" value={i} className="accent-midnight" />
              <span className="text-sm text-midnight">{i}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <SubmitButton label="Stand with Zenith" />
      </div>
      <FormStatus state={state} />
    </form>
  );
}
