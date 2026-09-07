'use client';

import type { LoginField, LoginState } from './loginContract';

import { useActionState, useState } from 'react';

import { loginUser } from '../actions';

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
      className="mx-auto flex max-w-xs flex-col gap-y-4"
      noValidate
      onSubmit={recordSubmission}
    >
      <input
        type="hidden"
        name="destination"
        id="destination"
        value={destination}
      />

      <div className="flex w-full flex-col gap-y-2">
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
          className="appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2"
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

      <div className="flex w-full flex-col gap-y-2">
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
          className="appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2"
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
      className="whitespace-no-wrap block w-full rounded-md border border-carnation-400 bg-carnation-400 px-3 py-2 text-base font-medium leading-6 text-white shadow-sm hover:cursor-pointer hover:bg-red-900 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
    >
      {pending ? 'Signing in…' : submitLabel}
    </button>
  );
}
