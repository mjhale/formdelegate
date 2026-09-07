'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { acceptInvitationAction, type AcceptInvitationState } from './actions';

const initialState: AcceptInvitationState = {
  message: null,
};

export default function AcceptInvitationForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(
    acceptInvitationAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col items-center gap-4">
      <input name="token" type="hidden" value={token} />

      <p className="text-center text-sm text-slate-700">
        Accept this invitation to join the team in Form Delegate.
      </p>

      {state.message && (
        <p aria-live="polite" className="text-center text-sm text-red-600">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={pending}
      className="whitespace-no-wrap inline-block rounded-md border border-gray-200 bg-white px-3 py-1 text-base font-medium leading-6 text-gray-600 shadow-sm hover:cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Accepting...' : 'Accept invitation'}
    </button>
  );
}
