'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

export type ConfirmationRequestState = {
  status: 'idle' | 'success' | 'error' | 'limited' | 'verified';
  retryAt?: number;
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
      <SubmitButton
        key={state.retryAt ?? state.status}
        retryAt={state.retryAt}
        verified={state.status === 'verified'}
      />
      {state.message && (
        <p
          className={`mt-4 rounded-md border p-3 text-sm ${
            state.status === 'success' || state.status === 'verified'
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

function SubmitButton({
  retryAt,
  verified,
}: {
  retryAt?: number;
  verified: boolean;
}) {
  const { pending } = useFormStatus();
  const [now, setNow] = useState(() => (retryAt ? Date.now() : 0));

  useEffect(() => {
    if (!retryAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  const remaining = Math.max(0, Math.ceil(((retryAt || 0) - now) / 1000));

  return (
    <button
      type="submit"
      disabled={pending || remaining > 0 || verified}
      className="rounded-md bg-carnation-400 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? 'Sending…'
        : verified
          ? 'Email already verified'
          : remaining > 0
            ? `Resend available again in ${remaining} seconds`
            : 'Send confirmation link'}
    </button>
  );
}
