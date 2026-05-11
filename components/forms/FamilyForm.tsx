"use client";

import { useActionState } from "react";
import { submitFamilyForm } from "@/app/actions/family";
import { idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "./FormStatus";
import { SubmitButton } from "./SubmitButton";

export function FamilyForm() {
  const [state, action] = useActionState(submitFamilyForm, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-white border border-aurora p-8">
        <p className="eyebrow text-eventide">Welcome to Zenith</p>
        <p className="mt-3 text-xl font-semibold text-midnight">{state.message}</p>
        <p className="mt-3 text-midnight-75">
          Check your inbox for a confirmation email. We&apos;ll be in touch with milestones and
          opportunities to stay involved.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="parent_name">Parent or guardian name <span aria-hidden className="text-red-600">*</span></label>
          <input id="parent_name" name="parent_name" type="text" required className={inputClass} autoComplete="name" />
          <FieldError message={fe.parent_name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">Email <span aria-hidden className="text-red-600">*</span></label>
          <input id="email" name="email" type="email" required className={inputClass} autoComplete="email" />
          <FieldError message={fe.email} />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" className={inputClass} autoComplete="tel" />
          <FieldError message={fe.phone} />
        </div>
        <div>
          <label className={labelClass} htmlFor="zip_code">Zip code <span aria-hidden className="text-red-600">*</span></label>
          <input id="zip_code" name="zip_code" type="text" required inputMode="numeric" pattern="\d{5}" maxLength={5} className={inputClass} autoComplete="postal-code" />
          <FieldError message={fe.zip_code} />
        </div>
        <div>
          <label className={labelClass} htmlFor="student_name">Student name <span aria-hidden className="text-red-600">*</span></label>
          <input id="student_name" name="student_name" type="text" required className={inputClass} />
          <FieldError message={fe.student_name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="current_grade">Current grade <span aria-hidden className="text-red-600">*</span></label>
          <select id="current_grade" name="current_grade" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select current grade</option>
            {["6","7","8","9","10","11"].map((g) => <option key={g} value={g}>{g}th grade</option>)}
          </select>
          <FieldError message={fe.current_grade} />
        </div>
        <div>
          <label className={labelClass} htmlFor="expected_grade">Expected grade at Zenith opening <span aria-hidden className="text-red-600">*</span></label>
          <select id="expected_grade" name="expected_grade" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select expected grade</option>
            {["9","10","11","12"].map((g) => <option key={g} value={g}>{g}th grade</option>)}
          </select>
          <FieldError message={fe.expected_grade} />
        </div>
        <div>
          <span className={labelClass}>Preferred contact method <span aria-hidden className="text-red-600">*</span></span>
          <div className="flex flex-wrap gap-3">
            {[
              { v: "email", l: "Email" },
              { v: "phone", l: "Phone" },
              { v: "text", l: "Text" },
            ].map((o) => (
              <label key={o.v} className="flex items-center gap-2 rounded-lg border border-ion bg-white px-3 py-2 cursor-pointer hover:border-eventide">
                <input type="radio" name="preferred_contact" value={o.v} required className="accent-midnight" />
                <span className="text-sm text-midnight">{o.l}</span>
              </label>
            ))}
          </div>
          <FieldError message={fe.preferred_contact} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="how_heard">How did you hear about Zenith?</label>
        <textarea id="how_heard" name="how_heard" rows={3} className={inputClass} />
        <FieldError message={fe.how_heard} />
      </div>
      <div className="flex items-center gap-4">
        <SubmitButton label="Join the Interest List" />
        <p className="text-sm text-midnight-75">We&apos;ll never share your information.</p>
      </div>
      <FormStatus state={state} />
    </form>
  );
}
