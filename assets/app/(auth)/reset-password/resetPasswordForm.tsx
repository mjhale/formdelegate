'use client';

import { useFormState } from 'react-dom';

import { resetPasswordAction } from '../actions';

const initialState = {
  message: '',
  errors: {},
};

export default function ResetPasswordForm({ token }) {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  return (
    <>
      <form
        className="flex flex-col gap-y-2 max-w-xs mx-auto"
        action={formAction}
      >
        {!!state?.message && <p className="text-sm">{state.message}</p>}

        <input
          id="reset_password_token"
          name="reset_password_token"
          type="hidden"
          value={token}
        />

        <div className="flex flex-col gap-y-2 w-full">
          <label className="font-medium" htmlFor="password">
            New Password
          </label>
          <input
            name="password"
            id="password"
            type="password"
            className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
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

        <div className="flex flex-col gap-y-2 w-full">
          <label className="font-medium" htmlFor="password_confirmation">
            Password Confirmation
          </label>
          <input
            name="password_confirmation"
            id="password_confirmation"
            type="password"
            className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
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
            className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
          />
        </div>
      </form>
    </>
  );
}
