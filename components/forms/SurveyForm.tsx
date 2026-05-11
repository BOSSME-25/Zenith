"use client";

import { useActionState } from "react";
import { submitSurveyForm } from "@/app/actions/survey";
import { CAREER_PATHWAYS, idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "./FormStatus";
import { SubmitButton } from "./SubmitButton";

export function SurveyForm() {
  const [state, action] = useActionState(submitSurveyForm, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-white border border-aurora p-8">
        <p className="eyebrow text-eventide">Thank you</p>
        <p className="mt-3 text-xl font-semibold text-midnight">{state.message}</p>
        <p className="mt-3 text-midnight-75">
          Your answers are now part of how we design Zenith. We&apos;ll share what we hear back as we move
          through charter authorization.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      <fieldset>
        <legend className={labelClass}>Are you a Maryvale resident?</legend>
        <div className="flex gap-3">
          {[
            { v: "yes", l: "Yes" },
            { v: "no", l: "No" },
          ].map((o) => (
            <label key={o.v} className="flex items-center gap-2 rounded-lg border border-ion bg-white px-4 py-2 cursor-pointer hover:border-eventide">
              <input type="radio" name="is_resident" value={o.v} className="accent-midnight" />
              <span className="text-sm text-midnight">{o.l}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>Do you have a child who could attend Zenith?</legend>
        <div className="flex gap-3">
          {[
            { v: "yes", l: "Yes" },
            { v: "no", l: "No" },
          ].map((o) => (
            <label key={o.v} className="flex items-center gap-2 rounded-lg border border-ion bg-white px-4 py-2 cursor-pointer hover:border-eventide">
              <input type="radio" name="has_child" value={o.v} className="accent-midnight" />
              <span className="text-sm text-midnight">{o.l}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>Career pathways most important to your family</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {CAREER_PATHWAYS.map((c) => (
            <label key={c} className="flex items-center gap-2 rounded-lg border border-ion bg-white px-3 py-2 cursor-pointer hover:border-eventide">
              <input type="checkbox" name="career_pathways" value={c} className="accent-midnight" />
              <span className="text-sm text-midnight">{c}</span>
            </label>
          ))}
        </div>
        <FieldError message={fe.career_pathways} />
      </fieldset>

      <div>
        <label className={labelClass} htmlFor="important_to_family">What is most important to you in a high school?</label>
        <textarea id="important_to_family" name="important_to_family" rows={4} className={inputClass} />
        <FieldError message={fe.important_to_family} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="survey_name">Name (optional)</label>
          <input id="survey_name" name="name" type="text" className={inputClass} autoComplete="name" />
          <FieldError message={fe.name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="survey_email">Email (optional)</label>
          <input id="survey_email" name="email" type="email" className={inputClass} autoComplete="email" />
          <FieldError message={fe.email} />
        </div>
      </div>

      <div>
        <SubmitButton label="Submit Survey" />
      </div>
      <FormStatus state={state} />
    </form>
  );
}
