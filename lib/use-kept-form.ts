import { startTransition, useActionState, type FormEvent } from "react";

/**
 * useActionState for a form that must not lose what the person typed.
 *
 * React 19 clears an uncontrolled form once its action finishes — even when
 * the action returned an error. For a long message, or a family's whole
 * signup, a single typo or a failed save then wipes everything. Submitting by
 * hand instead of through <form action> avoids the reset: the fields keep
 * their values and the error appears beside them.
 *
 * Because the form is no longer submitting through its action prop,
 * useFormStatus stays idle, so pending is returned here — pass it to
 * <SubmitButton pending={pending} />.
 */
export function useKeptFormAction<S>(
  action: (prev: Awaited<S>, formData: FormData) => S | Promise<S>,
  initial: Awaited<S>,
) {
  const [state, dispatch, pending] = useActionState(action, initial);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      dispatch(formData);
    });
  }

  return { state, pending, onSubmit };
}
