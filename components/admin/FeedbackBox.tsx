"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquareText, X } from "lucide-react";
import { submitFeedback } from "@/app/actions/feedback";
import {
  FEEDBACK_ROLES,
  FEEDBACK_ROLE_LABELS,
  FEEDBACK_TOPICS,
  FEEDBACK_TOPIC_LABELS,
  idleState,
} from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { BotFields } from "@/components/forms/BotFields";
import { useKeptFormAction } from "@/lib/use-kept-form";

/**
 * "Share feedback" on the admin sign-in page, for board members, faculty and
 * staff. It sits outside the login card on purpose: it is open to anyone who
 * reaches the page, so it must never look like part of signing in.
 */
export function FeedbackBox() {
  const [open, setOpen] = useState(false);
  const { state, pending, onSubmit } = useKeptFormAction(submitFeedback, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  if (state.status === "success") {
    return (
      <div className="w-full rounded-2xl bg-white text-midnight p-6 shadow-xl flex items-start gap-3">
        <CheckCircle2 size={22} aria-hidden className="mt-0.5 flex-none text-aurora" />
        <div>
          <p className="font-semibold">{state.message}</p>
          <p className="mt-1 text-sm text-midnight-75">
            If you left an email address, someone may follow up with you.
          </p>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-ion/60 px-5 py-2.5 text-sm font-semibold text-ion transition-colors hover:bg-ion hover:text-midnight"
      >
        <MessageSquareText size={16} aria-hidden />
        Share feedback or suggest a change
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white text-midnight p-6 md:p-8 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Share feedback</h2>
          <p className="mt-1 text-sm text-midnight-75">
            For board members, faculty, and staff: suggest a change, send information we asked for,
            or tell us something is wrong on the site.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close the feedback form"
          className="flex-none text-midnight-75 hover:text-midnight"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      {/* Submitted by hand so a typo or a failed save never wipes a long message
          (see lib/use-kept-form.ts). */}
      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fb_name">
              Your name <span aria-hidden className="text-red-600">*</span>
            </label>
            <input id="fb_name" name="name" type="text" required autoComplete="name" className={inputClass} />
            <FieldError message={fe.name} />
          </div>
          <div>
            <label className={labelClass} htmlFor="fb_role">
              Your role <span aria-hidden className="text-red-600">*</span>
            </label>
            <select id="fb_role" name="role" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Choose one
              </option>
              {FEEDBACK_ROLES.map((r) => (
                <option key={r} value={r}>
                  {FEEDBACK_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <FieldError message={fe.role} />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="fb_topic">
            What is this about? <span aria-hidden className="text-red-600">*</span>
          </label>
          <select id="fb_topic" name="topic" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choose one
            </option>
            {FEEDBACK_TOPICS.map((t) => (
              <option key={t} value={t}>
                {FEEDBACK_TOPIC_LABELS[t]}
              </option>
            ))}
          </select>
          <FieldError message={fe.topic} />
        </div>

        <div>
          <label className={labelClass} htmlFor="fb_page">
            Which page or section? <span className="font-normal text-midnight-50">(optional)</span>
          </label>
          <input
            id="fb_page"
            name="page"
            type="text"
            placeholder="e.g. Our Board, the FAQ, the newsletter"
            className={inputClass}
          />
          <FieldError message={fe.page} />
        </div>

        <div>
          <label className={labelClass} htmlFor="fb_message">
            Your message <span aria-hidden className="text-red-600">*</span>
          </label>
          <textarea id="fb_message" name="message" rows={5} required className={inputClass} />
          <FieldError message={fe.message} />
        </div>

        <div>
          <label className={labelClass} htmlFor="fb_email">
            Email <span className="font-normal text-midnight-50">(optional, if you&apos;d like a reply)</span>
          </label>
          <input id="fb_email" name="email" type="email" autoComplete="email" className={inputClass} />
          <FieldError message={fe.email} />
        </div>

        <p className="text-xs text-midnight-75">
          Please don&apos;t include students&apos; names or other personal details.
        </p>

        <BotFields formId="feedback" />
        <SubmitButton label="Send feedback" pending={pending} />
        <FormStatus state={state} />
      </form>
    </div>
  );
}
