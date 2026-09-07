'use client';

import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useState } from 'react';
import { useActionState } from 'react';

import { createUserAction } from './actions';

const initialState = {
  message: null,
  errors: {},
};

export default function SignupForm({
  destination = '',
  submitLabel = 'Create User',
}: {
  destination?: string;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(createUserAction, initialState);
  const [captchaKey, setCaptchaKey] = useState('');

  const CAPTCHA_SITE_KEY: string = process.env
    .NEXT_PUBLIC_CAPTCHA_SITE_KEY as string;

  return (
    <>
      <form className="flex flex-col gap-y-4" action={formAction}>
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
            type="text"
            className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2"
            aria-describedby="user.email.error"
          />
        </div>
        <div id={`user.email.error`} aria-live="polite" aria-atomic="true">
          {state?.errors?.user?.email &&
            state.errors.user.email._errors.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div className="flex h-10 max-w-xl items-center">
          {/* Name */}
          <label className="flex-0 w-1/4" htmlFor="user.name">
            Full Name
          </label>
          <input
            name="user.name"
            id="user.name"
            type="text"
            className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2"
            aria-describedby="user.name.error"
          />
        </div>
        <div id={`user.name.error`} aria-live="polite" aria-atomic="true">
          {state?.errors?.user?.name &&
            state.errors.user.name._errors.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div className="flex h-10 max-w-xl items-center">
          {/* Password */}
          <label className="flex-0 w-1/4" htmlFor="user.password">
            Password
          </label>
          <input
            name="user.password"
            id="user.password"
            type="password"
            className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2"
            aria-describedby="user.password.error"
          />
        </div>
        <div id={`user.password.error`} aria-live="polite" aria-atomic="true">
          {state?.errors?.user?.password &&
            state.errors.user.password._errors.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div className="flex h-10 max-w-xl items-center">
          {/* Password confirmation */}
          <label className="flex-0 w-1/4" htmlFor="user.password_confirmation">
            Confirm Password
          </label>
          <input
            name="user.password_confirmation"
            id="user.password_confirmation"
            type="password"
            className="flex-1 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow-sm focus:outline-none focus:ring-2"
            aria-describedby="user.password_confirmation.error"
          />
        </div>
        <div
          id={`user.password_confirmation.error`}
          aria-live="polite"
          aria-atomic="true"
        >
          {state?.errors?.user?.password_confirmation &&
            state.errors.user.password_confirmation._errors.map(
              (error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              )
            )}
        </div>

        {/* Captcha */}
        <div className="flex max-w-xl">
          <HCaptcha
            reCaptchaCompat={false}
            sitekey={CAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptchaKey(token)}
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
          {state?.errors?.captcha &&
            state.errors.captcha._errors.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div>
          <input
            type="submit"
            value={submitLabel}
            className="whitespace-no-wrap inline-block rounded-md border border-carnation-400 bg-carnation-400 px-3 py-2 text-base font-medium leading-6 text-white shadow-sm hover:cursor-pointer hover:bg-red-900 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
          />
        </div>
      </form>
    </>
  );
}
