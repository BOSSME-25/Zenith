"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import {
  createUser,
  resetUserPassword,
  setUserActive,
  setUserRole,
  unlockUser,
  type UserActionState,
} from "@/app/actions/admin-users";
import { useKeptFormAction } from "@/lib/use-kept-form";
import { idleState } from "@/lib/validators";
import { FieldError, FormStatus, inputClass, labelClass } from "@/components/forms/FormStatus";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, type Role } from "@/lib/admin-access";

const PRIMARY =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-midnight px-5 py-2 text-sm font-semibold text-white hover:bg-midnight-75 transition-colors disabled:opacity-70";
const QUIET =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ion bg-white px-5 py-2 text-sm font-semibold text-midnight hover:bg-ion-soft transition-colors disabled:opacity-70";
const DANGER =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-70";

/** The one time a temporary password is shown. It is never stored in readable form. */
function TempPassword({ value, name }: { value: string; name?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div role="alert" className="mt-4 rounded-xl border border-aurora bg-aurora-25 p-4">
      <p className="text-sm font-semibold text-midnight">
        Temporary password{name ? ` for ${name}` : ""}. It is shown only once.
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-3">
        <code className="rounded-md bg-white px-3 py-2 text-lg font-semibold tracking-wide text-midnight">
          {value}
        </code>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
            } catch {
              // Clipboard blocked: the password is on screen to read.
            }
          }}
          className={QUIET}
        >
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </p>
      <p className="mt-2 text-sm text-midnight-75">
        Give it to them by phone or in person, not in a group chat. They are asked to choose their
        own password the first time they sign in.
      </p>
    </div>
  );
}

function Result({ state }: { state: UserActionState }) {
  return (
    <div role="status" aria-live="polite">
      <FormStatus state={state} />
      {state.status === "success" && "tempPassword" in state && (
        <TempPassword value={state.tempPassword} />
      )}
    </div>
  );
}

export function CreateUserForm() {
  const { state, pending, onSubmit } = useKeptFormAction(createUser, idleState as UserActionState);
  const fe = state.status === "error" ? state.fieldErrors || {} : {};
  const [role, setRole] = useState<Role>("school");

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="new_name">Name</label>
          <input id="new_name" name="name" type="text" autoComplete="off" className={inputClass} />
          <FieldError message={fe.name} />
        </div>
        <div>
          <label className={labelClass} htmlFor="new_title">Title (optional)</label>
          <input
            id="new_title"
            name="title"
            type="text"
            placeholder="Secretary"
            autoComplete="off"
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-midnight-75">
            Shown next to their name in the log, for example &ldquo;Lynn Palacios, Secretary&rdquo;.
          </p>
        </div>
        <div>
          <label className={labelClass} htmlFor="new_email">Email (their sign-in)</label>
          <input id="new_email" name="email" type="email" autoComplete="off" className={inputClass} />
          <FieldError message={fe.email} />
        </div>
        <div>
          <label className={labelClass} htmlFor="new_role">Role</label>
          <select
            id="new_role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={inputClass}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-midnight-75">{ROLE_DESCRIPTIONS[role]}</p>
          <FieldError message={fe.role} />
        </div>
      </div>
      <SubmitButton label="Create login" pendingLabel="Creating…" pending={pending} className={PRIMARY} />
      <Result state={state} />
    </form>
  );
}

function ActionForm({
  action,
  hidden,
  label,
  tone = "quiet",
  confirmText,
  children,
}: {
  action: (prev: UserActionState, formData: FormData) => Promise<UserActionState>;
  hidden: Record<string, string>;
  label: string;
  tone?: "primary" | "quiet" | "danger";
  confirmText?: string;
  children?: ReactNode;
}) {
  const { state, pending, onSubmit } = useKeptFormAction(action, idleState as UserActionState);
  function handle(e: FormEvent<HTMLFormElement>) {
    if (confirmText && !window.confirm(confirmText)) {
      e.preventDefault();
      return;
    }
    onSubmit(e);
  }
  return (
    <form onSubmit={handle} className="space-y-2">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div className="flex flex-wrap items-end gap-3">
        {children}
        <SubmitButton
          label={label}
          pendingLabel="Working…"
          pending={pending}
          className={tone === "primary" ? PRIMARY : tone === "danger" ? DANGER : QUIET}
        />
      </div>
      <Result state={state} />
    </form>
  );
}

/** Everything the developer can do to one login. */
export function UserActions({
  id,
  name,
  role,
  active,
  locked,
}: {
  id: number;
  name: string;
  role: Role;
  active: boolean;
  locked: boolean;
}) {
  const hidden = { id: String(id) };
  return (
    <details className="group">
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-eventide underline underline-offset-2 hover:text-midnight">
        Manage
      </summary>
      <div className="mt-3 space-y-5 rounded-xl border border-ion bg-ion-soft p-4">
        {active && (
          <>
            <ActionForm
              action={resetUserPassword}
              hidden={hidden}
              label="Reset password"
              confirmText={`Reset ${name}'s password? They will be signed out and need the new temporary one.`}
            />
            <ActionForm action={setUserRole} hidden={hidden} label="Change role">
              <div>
                <label className={labelClass} htmlFor={`role_${id}`}>Role</label>
                <select id={`role_${id}`} name="role" defaultValue={role} className={inputClass}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </ActionForm>
            {locked && (
              <ActionForm action={unlockUser} hidden={hidden} label="Unlock this login" />
            )}
          </>
        )}
        <ActionForm
          action={setUserActive}
          hidden={{ ...hidden, active: String(!active) }}
          label={active ? "Switch off this login" : "Switch this login back on"}
          tone={active ? "danger" : "primary"}
          confirmText={active ? `Switch off ${name}? They are signed out immediately.` : undefined}
        />
      </div>
    </details>
  );
}
