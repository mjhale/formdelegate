'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { loginUser } from '../actions';

const initialState = {
  message: null,
  errors: {},
};

export default function LoginForm({
  destination = '',
  submitLabel = 'Login',
}: {
  destination?: string;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(loginUser, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-y-4 max-w-xs mx-auto"
    >
      <input
        type="hidden"
        name="destination"
        id="destination"
        value={destination}
      />

      <div className="flex flex-col gap-y-2 w-full">
        <label className="font-medium" htmlFor="email">
          Email
        </label>
        <input
          name="email"
          id="email"
          type="text"
          autoComplete="off"
          className="appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
          aria-describedby="email.error"
          required
        />
        {state?.errors?.email &&
          state?.errors.email._errors.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>

      <div className="flex flex-col gap-y-2 w-full">
        <label className="font-medium" htmlFor="password">
          Password
        </label>
        <input
          name="password"
          id="password"
          type="password"
          autoComplete="off"
          className="appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
          aria-describedby="password.error"
          required
        />
        {state?.errors?.password &&
          state?.errors.password._errors.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>

      <p aria-live="polite" className="">
        {state?.message && state.message}
      </p>

      <div>
        <SubmitButton submitLabel={submitLabel} />
      </div>
    </form>
  );
}

function SubmitButton({ submitLabel }: { submitLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="block w-full px-3 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-carnation-400 border border-carnation-400 rounded-md shadow-sm hover:bg-red-900 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
    >
      {pending ? 'Logging in...' : submitLabel}
    </button>
  );
}
