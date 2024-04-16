'use client';

import { useFormState } from 'react-dom';

import { requestPasswordResetAction } from '../actions';

const initialState = {
  message: '',
  errors: {},
};

export default function ResetRequestForm() {
  const [state, formAction] = useFormState(
    requestPasswordResetAction,
    initialState
  );

  return (
    <>
      <form
        className="flex flex-col gap-y-2 max-w-xs mx-auto"
        action={formAction}
      >
        {!!state?.message && <p className="text-sm">{state.message}</p>}

        <div className="flex flex-col gap-y-2 w-full">
          <label className="font-medium" htmlFor="email">
            Email
          </label>
          <input
            name="email"
            id="email"
            type="text"
            className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
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
            className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
          />
        </div>
      </form>
    </>
  );
}
