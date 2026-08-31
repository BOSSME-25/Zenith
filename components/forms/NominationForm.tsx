"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitNomination } from "@/app/actions/nomination";
import {
  MILESTONE_LABELS,
  MILESTONE_TYPES,
  NOMINATOR_RELATIONSHIPS,
  RELATIONSHIP_LABELS,
  idleState,
} from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "./FormStatus";
import { SubmitButton } from "./SubmitButton";

const DESCRIPTION_LIMIT = 500;

export function NominationForm({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [state, action] = useActionState(submitNomination, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};
  const [remaining, setRemaining] = useState(DESCRIPTION_LIMIT);
  // Stamped on mount so the server can measure how long the form was open.
  const loadedAt = useRef<number>(0);

  useEffect(() => {
    loadedAt.current = Date.now();
  }, []);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-white border border-aurora p-8">
        <p className="eyebrow text-eventide">Nomination received</p>
        <p className="mt-3 text-xl font-semibold text-midnight">{state.message}</p>
      </div>
    );
  }

  return (
    <>
      {turnstileSiteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      )}
      <form action={action} className="space-y-5" noValidate>
        <input type="hidden" name="form_loaded_at" value={loadedAt.current} />

        {/* Honeypot. Positioned off-screen rather than display:none, which the
            more capable bots detect and skip. Hidden from assistive tech too. */}
        <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div>
          <label className={labelClass} htmlFor="nominee_name">
            Nominee&apos;s name <span aria-hidden className="text-red-600">*</span>
          </label>
          <input id="nominee_name" name="nominee_name" type="text" required className={inputClass} />
          <FieldError message={fe.nominee_name} />
        </div>

        <div>
          <label className={labelClass} htmlFor="nominee_grade_or_grad_year">
            Their current grade or graduation year <span aria-hidden className="text-red-600">*</span>
          </label>
          <input
            id="nominee_grade_or_grad_year"
            name="nominee_grade_or_grad_year"
            type="text"
            required
            placeholder="e.g. 10th grade, or Class of 2031"
            className={inputClass}
          />
          <FieldError message={fe.nominee_grade_or_grad_year} />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="nominator_name">
              Your name <span aria-hidden className="text-red-600">*</span>
            </label>
            <input
              id="nominator_name"
              name="nominator_name"
              type="text"
              required
              className={inputClass}
              autoComplete="name"
            />
            <FieldError message={fe.nominator_name} />
          </div>
          <div>
            <label className={labelClass} htmlFor="nominator_relationship">
              Your relationship to them <span aria-hidden className="text-red-600">*</span>
            </label>
            <select
              id="nominator_relationship"
              name="nominator_relationship"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>
                Choose one
              </option>
              {NOMINATOR_RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {RELATIONSHIP_LABELS[r]}
                </option>
              ))}
            </select>
            <FieldError message={fe.nominator_relationship} />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="nominator_email">
            Your email <span aria-hidden className="text-red-600">*</span>
          </label>
          <input
            id="nominator_email"
            name="nominator_email"
            type="email"
            required
            className={inputClass}
            autoComplete="email"
            aria-describedby="nominator_email_help"
          />
          <p id="nominator_email_help" className="mt-1.5 text-sm text-midnight-75">
            We&apos;ll only use this to follow up on your nomination. It won&apos;t be published.
          </p>
          <FieldError message={fe.nominator_email} />
        </div>

        <div>
          <label className={labelClass} htmlFor="milestone_type">
            What kind of milestone is this? <span aria-hidden className="text-red-600">*</span>
          </label>
          <select id="milestone_type" name="milestone_type" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choose one
            </option>
            {MILESTONE_TYPES.map((m) => (
              <option key={m} value={m}>
                {MILESTONE_LABELS[m]}
              </option>
            ))}
          </select>
          <FieldError message={fe.milestone_type} />
        </div>

        <div>
          <label className={labelClass} htmlFor="description">
            Tell us their story <span aria-hidden className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            maxLength={DESCRIPTION_LIMIT}
            onChange={(e) => setRemaining(DESCRIPTION_LIMIT - e.target.value.length)}
            placeholder="Two or three sentences on why they stand out."
            className={inputClass}
            aria-describedby="description_help"
          />
          <p id="description_help" className="mt-1.5 text-sm text-midnight-75">
            {remaining} characters remaining.
          </p>
          <FieldError message={fe.description} />
        </div>

        <div>
          <label className={labelClass} htmlFor="nominee_contact_info">
            If this isn&apos;t a self-nomination, how can we reach them?
          </label>
          <textarea
            id="nominee_contact_info"
            name="nominee_contact_info"
            rows={3}
            className={inputClass}
            placeholder="Optional — an email, a parent's phone number, or the staff member who knows them best."
          />
          <FieldError message={fe.nominee_contact_info} />
        </div>

        {turnstileSiteKey && (
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" />
        )}

        <div>
          <SubmitButton label="Submit Nomination" />
        </div>
        <FormStatus state={state} />
      </form>
    </>
  );
}
