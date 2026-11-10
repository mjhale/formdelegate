'use client';

import type { SignupField, SignupState } from './signupContract';

import HCaptcha from '@hcaptcha/react-hcaptcha';
import Link from 'next/link';
import { useActionState, useState } from 'react';

import { createUserAction } from './actions';

const initialState: SignupState = { status: 'idle' };

type UserField = Exclude<SignupField, 'captcha'>;

// The API consumes the hCaptcha token, so a new one is needed after it saw it.
function spentCaptcha(state: SignupState) {
  return (
    state.status === 'captcha_error' ||
    state.status === 'service_error' ||
    (state.status === 'field_error' && state.captchaSpent)
  );
}

export default function SignupForm({
  destination = '',
  submitLabel = 'Create User',
}: {
  destination?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initialState
  );
  const [values, setValues] = useState<Record<UserField, string>>({
    email: '',
    name: '',
    password: '',
    password_confirmation: '',
  });
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaResets, setCaptchaResets] = useState(0);
  const [handledState, setHandledState] = useState(state);

  // Adjust state while rendering when a new action result arrives.
  if (state !== handledState) {
    setHandledState(state);

    if (spentCaptcha(state)) {
      setCaptchaKey('');
      setCaptchaResets((count) => count + 1);
    }
  }

  const CAPTCHA_SITE_KEY: string = process.env
    .NEXT_PUBLIC_CAPTCHA_SITE_KEY as string;

  const fieldErrors = state.status === 'field_error' ? state.fieldErrors : {};
  const formMessage =
    !pending &&
    (state.status === 'captcha_error' ||
      state.status === 'service_error' ||
      state.status === 'sign_in_error')
      ? state.message
      : null;
  const loginHref = destination
    ? `/login?${new URLSearchParams({ destination }).toString()}`
    : '/login';

  function updateValue(field: UserField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function errorsFor(field: SignupField) {
    return (fieldErrors[field] ?? []).map((error) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ));
  }

  return (
    <>
      <form
        className="flex flex-col gap-y-4"
        action={formAction}
        aria-busy={pending}
      >
        <input
          id="destination"
          name="destination"
          type="hidden"
          value={destination}
        />

        <div className="flex h-10 max-w-xl items-center">
          {/* Email */}
          <label className="flex-0 w-1/4" htmlFor="user.email">
            Email
          </label>
          <input
            name="user.email"
            id="user.email"
            value={values.email}
            onChange={(event) => updateValue('email', event.target.value)}
            type="text"
            className="flex-1 appearance-none rounded-sm border px-3 py-2 leading-tight text-gray-700 shadow-xs focus:outline-hidden focus:ring-2"
            aria-describedby="user.email.error"
          />
        </div>
        <div id={`user.email.error`} aria-live="polite" aria-atomic="true">
          {errorsFor('email')}
        </div>

        <div className="flex h-10 max-w-xl items-center">
          {/* Name */}
          <label className="flex-0 w-1/4" htmlFor="user.name">
            Full Name
          </label>
          <input
            name="user.name"
            id="user.name"
            value={values.name}
            onChange={(event) => updateValue('name', event.target.value)}
            type="text"
            className="flex-1 appearance-none rounded-sm border px-3 py-2 leading-tight text-gray-700 shadow-xs focus:outline-hidden focus:ring-2"
            aria-describedby="user.name.error"
          />
        </div>
        <div id={`user.name.error`} aria-live="polite" aria-atomic="true">
          {errorsFor('name')}
        </div>

        <div className="flex h-10 max-w-xl items-center">
          {/* Password */}
          <label className="flex-0 w-1/4" htmlFor="user.password">
            Password
          </label>
          <input
            name="user.password"
            id="user.password"
            value={values.password}
            onChange={(event) => updateValue('password', event.target.value)}
            type="password"
            className="flex-1 appearance-none rounded-sm border px-3 py-2 leading-tight text-gray-700 shadow-xs focus:outline-hidden focus:ring-2"
            aria-describedby="user.password.error"
          />
        </div>
        <div id={`user.password.error`} aria-live="polite" aria-atomic="true">
          {errorsFor('password')}
        </div>

        <div className="flex h-10 max-w-xl items-center">
          {/* Password confirmation */}
          <label className="flex-0 w-1/4" htmlFor="user.password_confirmation">
            Confirm Password
          </label>
          <input
            name="user.password_confirmation"
            id="user.password_confirmation"
            value={values.password_confirmation}
            onChange={(event) =>
              updateValue('password_confirmation', event.target.value)
            }
            type="password"
            className="flex-1 appearance-none rounded-sm border px-3 py-2 leading-tight text-gray-700 shadow-xs focus:outline-hidden focus:ring-2"
            aria-describedby="user.password_confirmation.error"
          />
        </div>
        <div
          id={`user.password_confirmation.error`}
          aria-live="polite"
          aria-atomic="true"
        >
          {errorsFor('password_confirmation')}
        </div>

        {/* Captcha */}
        <div className="flex max-w-xl">
          <HCaptcha
            key={captchaResets}
            reCaptchaCompat={false}
            sitekey={CAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptchaKey(token)}
            onExpire={() => setCaptchaKey('')}
          />
          <input
            name="captcha"
            id="captcha"
            type="hidden"
            aria-describedby="captcha.error"
            value={captchaKey}
          />
        </div>
        <div id={`captcha.error`} aria-live="polite" aria-atomic="true">
          {errorsFor('captcha')}
        </div>

        {formMessage && (
          <div
            aria-atomic="true"
            className="max-w-xl rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            <p>{formMessage}</p>
            {state.status === 'sign_in_error' && (
              <Link className="mt-2 inline-block underline" href={loginHref}>
                Go to login
              </Link>
            )}
          </div>
        )}

        <div>
          <input
            type="submit"
            value={pending ? 'Creating account…' : submitLabel}
            disabled={pending}
            aria-disabled={pending}
            className="whitespace-no-wrap inline-block rounded-md border border-carnation-400 bg-carnation-400 px-3 py-2 text-base font-medium leading-6 text-white shadow-xs hover:cursor-pointer hover:bg-red-900 focus:outline-hidden focus:ring-2 active:shadow-sm active:shadow-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
          />
        </div>
      </form>
    </>
  );
}
