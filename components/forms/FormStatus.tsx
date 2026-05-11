import { CheckCircle2, AlertCircle } from "lucide-react";
import type { ActionState } from "@/lib/validators";

export function FormStatus({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  if (state.status === "success") {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-aurora-25 border border-aurora p-4 text-midnight">
        <CheckCircle2 size={20} className="mt-0.5 flex-none text-eventide" aria-hidden />
        <p className="text-sm leading-relaxed">{state.message}</p>
      </div>
    );
  }
  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl bg-white border border-red-300 p-4 text-midnight">
      <AlertCircle size={20} className="mt-0.5 flex-none text-red-600" aria-hidden />
      <p className="text-sm leading-relaxed">{state.message}</p>
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-ion bg-white px-3.5 py-2.5 text-base text-midnight placeholder:text-midnight-50 focus:border-eventide focus:outline-none focus:ring-2 focus:ring-eventide/40 disabled:opacity-60";

export const labelClass = "block text-sm font-semibold text-midnight mb-1.5";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-red-600">{message}</p>;
}
