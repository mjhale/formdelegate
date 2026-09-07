'use client';

import { useActionState } from 'react';

import { requestPasswordResetAction } from '../actions';

const initialState = {
  message: '',
  errors: {},
};

export default function ResetRequestForm() {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    initialState
  );

  return (
    <>
      <form
        className="mx-auto flex max-w-xs flex-col gap-y-2"
        action={formAction}
      >
        {!!state?.message && <p className="text-sm">{state.message}</p>}

        <div className="flex w-full flex-col gap-y-2">
          <label className="font-medium" htmlFor="email">
            Email
          </label>
          <input
            name="email"
            id="email"
            type="text"
            className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2"
            aria-describedby="email.error"
          />
        </div>
        <div id="email.error" aria-live="polite" aria-atomic="true">
          {state?.errors?.email &&
            state.errors.email._errors.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div>
          <input
            type="submit"
            value="Submit Request"
            className="whitespace-no-wrap inline-block rounded-md border border-gray-200 bg-white px-3 py-1 text-base font-medium leading-6 text-gray-600 shadow-sm hover:cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
          />
        </div>
      </form>
    </>
  );
}
