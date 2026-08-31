"use client";

import { useActionState, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { submitMentorConnect } from "@/app/actions/nomination";
import { idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "./forms/FormStatus";
import { SubmitButton } from "./forms/SubmitButton";

/**
 * "Connect with me" never exposes a Comet's own address — the message is
 * emailed to the school, and staff forward it if the Comet agrees.
 */
export function MentorConnectDialog({
  cometId,
  cometName,
}: {
  cometId: number;
  cometName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(submitMentorConnect, idleState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-eventide px-4 py-2 text-sm font-semibold text-eventide hover:bg-ion-soft"
      >
        <MessageSquare size={15} aria-hidden /> Connect with {cometName.split(" ")[0]}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-ion bg-ion-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-midnight">
          Message {cometName.split(" ")[0]}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close message form"
          className="text-midnight-75 hover:text-midnight"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      {state.status === "success" ? (
        <p className="mt-3 text-sm leading-relaxed text-midnight">{state.message}</p>
      ) : (
        <form action={action} className="mt-3 space-y-3" noValidate>
          <input type="hidden" name="comet_id" value={cometId} />
          <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
            <label htmlFor={`mc_website_${cometId}`}>Website</label>
            <input id={`mc_website_${cometId}`} name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <label className={labelClass} htmlFor={`mc_name_${cometId}`}>
              Your name
            </label>
            <input
              id={`mc_name_${cometId}`}
              name="sender_name"
              type="text"
              required
              className={inputClass}
              autoComplete="name"
            />
            <FieldError message={fe.sender_name} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`mc_email_${cometId}`}>
              Your email
            </label>
            <input
              id={`mc_email_${cometId}`}
              name="sender_email"
              type="email"
              required
              className={inputClass}
              autoComplete="email"
            />
            <FieldError message={fe.sender_email} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`mc_message_${cometId}`}>
              Your message
            </label>
            <textarea
              id={`mc_message_${cometId}`}
              name="message"
              rows={4}
              required
              className={inputClass}
              placeholder="What would you like to ask them about?"
            />
            <FieldError message={fe.message} />
          </div>
          <p className="text-xs text-midnight-75">
            Your message goes to the Zenith team, who will pass it along.
          </p>
          <SubmitButton label="Send Message" />
          <FormStatus state={state} />
        </form>
      )}
    </div>
  );
}
