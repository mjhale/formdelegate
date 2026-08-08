'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

export type ConfirmationRequestState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const initialState: ConfirmationRequestState = { status: 'idle' };

export default function ConfirmationRequestForm({
  action,
}: {
  action: (
    state: ConfirmationRequestState,
    formData: FormData
  ) => Promise<ConfirmationRequestState>;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6">
      <SubmitButton />
      {state.message && (
        <p
          className={`mt-4 rounded-md border p-3 text-sm ${
            state.status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
          role={state.status === 'error' ? 'alert' : 'status'}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-carnation-400 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Send confirmation link'}
    </button>
  );
}
