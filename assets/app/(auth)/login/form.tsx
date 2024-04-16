'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';

import { loginUser } from '../actions';

const initialState = {
  message: null,
  errors: {},
};

export default function LoginForm() {
  const [state, formAction] = useFormState(loginUser, initialState);
  const searchParams = useSearchParams();

  const destination = searchParams.get('destination') ?? '';

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
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="block w-full px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
    >
      {pending ? 'Logging in...' : 'Login'}
    </button>
  );
}
