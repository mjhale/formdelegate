'use client';

import { useActionState } from 'react';

import { resetPasswordAction } from '../actions';

const initialState = {
  message: '',
  errors: {},
};

export default function ResetPasswordForm({ token }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <>
      <form
        className="mx-auto flex max-w-xs flex-col gap-y-2"
        action={formAction}
      >
        {!!state?.message && <p className="text-sm">{state.message}</p>}

        <input
          id="reset_password_token"
          name="reset_password_token"
          type="hidden"
          value={token}
        />

        <div className="flex w-full flex-col gap-y-2">
          <label className="font-medium" htmlFor="password">
            New Password
          </label>
          <input
            name="password"
            id="password"
            type="password"
            className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2"
            aria-describedby="password.error"
            required
          />
        </div>
        <div id="password.error" aria-live="polite" aria-atomic="true">
          {state?.errors?.password &&
            state.errors.password._errors.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div className="flex w-full flex-col gap-y-2">
          <label className="font-medium" htmlFor="password_confirmation">
            Password Confirmation
          </label>
          <input
            name="password_confirmation"
            id="password_confirmation"
            type="password"
            className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2"
            aria-describedby="password_confirmation.error"
            required
          />
        </div>
        <div
          id="password_confirmation.error"
          aria-live="polite"
          aria-atomic="true"
        >
          {state?.errors?.password_confirmation &&
            state.errors.password_confirmation._errors.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div>
          <input
            type="submit"
            value="Reset Password"
            className="whitespace-no-wrap inline-block rounded-md border border-gray-200 bg-white px-3 py-1 text-base font-medium leading-6 text-gray-600 shadow-sm hover:cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
          />
        </div>
      </form>
    </>
  );
}
