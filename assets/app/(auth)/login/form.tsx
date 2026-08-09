'use client';

import { useActionState, useState } from 'react';

import { loginUser } from '../actions';
import type { LoginField, LoginState } from './loginContract';

const initialState: LoginState = { status: 'idle' };

type Credentials = Record<LoginField, string>;

export default function LoginForm({
  destination = '',
  submitLabel = 'Login',
}: {
  destination?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(loginUser, initialState);
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
  });
  const [submittedCredentials, setSubmittedCredentials] =
    useState<Credentials | null>(null);
  const [changedSinceSubmit, setChangedSinceSubmit] = useState<
    Record<LoginField, boolean>
  >({ email: false, password: false });

  function updateCredential(field: LoginField, value: string) {
    setCredentials((current) => ({ ...current, [field]: value }));

    if (
      submittedCredentials !== null &&
      value !== submittedCredentials[field]
    ) {
      setChangedSinceSubmit((current) => ({ ...current, [field]: true }));
    }
  }

  function credentialChanged(field: LoginField) {
    return changedSinceSubmit[field];
  }

  function recordSubmission() {
    setSubmittedCredentials(credentials);
    setChangedSinceSubmit({ email: false, password: false });
  }

  const emailErrors =
    state.status === 'field_error' && !credentialChanged('email')
      ? state.fieldErrors.email || []
      : [];
  const passwordErrors =
    state.status === 'field_error' && !credentialChanged('password')
      ? state.fieldErrors.password || []
      : [];
  const credentialsChanged =
    credentialChanged('email') || credentialChanged('password');
  const formMessage =
    !pending &&
    !credentialsChanged &&
    (state.status === 'invalid_credentials' || state.status === 'service_error')
      ? state.message
      : null;

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className="flex flex-col gap-y-4 max-w-xs mx-auto"
      noValidate
      onSubmit={recordSubmission}
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
          type="email"
          autoComplete="email"
          value={credentials.email}
          onChange={(event) => updateCredential('email', event.target.value)}
          className="appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
          aria-describedby={
            emailErrors.length > 0 ? 'login-email-error' : undefined
          }
          aria-invalid={emailErrors.length > 0}
          required
        />
        {emailErrors.length > 0 && (
          <p
            id="login-email-error"
            aria-live="polite"
            className="mt-2 text-sm text-red-600"
          >
            {emailErrors[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-y-2 w-full">
        <label className="font-medium" htmlFor="password">
          Password
        </label>
        <input
          name="password"
          id="password"
          type="password"
          autoComplete="current-password"
          value={credentials.password}
          onChange={(event) => updateCredential('password', event.target.value)}
          className="appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
          aria-describedby={
            passwordErrors.length > 0 ? 'login-password-error' : undefined
          }
          aria-invalid={passwordErrors.length > 0}
          required
        />
        {passwordErrors.length > 0 && (
          <p
            id="login-password-error"
            aria-live="polite"
            className="mt-2 text-sm text-red-600"
          >
            {passwordErrors[0]}
          </p>
        )}
      </div>

      {formMessage && (
        <p
          aria-atomic="true"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {formMessage}
        </p>
      )}

      <div>
        <SubmitButton pending={pending} submitLabel={submitLabel} />
      </div>
    </form>
  );
}

function SubmitButton({
  pending,
  submitLabel,
}: {
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="block w-full px-3 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-carnation-400 border border-carnation-400 rounded-md shadow-sm hover:bg-red-900 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
    >
      {pending ? 'Signing in…' : submitLabel}
    </button>
  );
}
