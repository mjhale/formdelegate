'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';

import { createUserAction } from './actions';

const initialState = {
  message: null,
  errors: {},
};

export default function SignupForm() {
  const [state, formAction] = useFormState(createUserAction, initialState);
  const [captchaKey, setCaptchaKey] = useState('');

  const CAPTCHA_SITE_KEY: string = process.env
    .NEXT_PUBLIC_CAPTCHA_SITE_KEY as string;

  return (
    <>
      <form className="flex flex-col gap-y-4" action={formAction}>
        <div className="flex items-center h-10 max-w-xl">
          {/* Email */}
          <label className="flex-0 w-1/4" htmlFor="user.email">
            Email
          </label>
          <input
            name="user.email"
            id="user.email"
            type="text"
            className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
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

        <div className="flex items-center h-10 max-w-xl">
          {/* Name */}
          <label className="flex-0 w-1/4" htmlFor="user.name">
            Full Name
          </label>
          <input
            name="user.name"
            id="user.name"
            type="text"
            className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
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

        <div className="flex items-center h-10 max-w-xl">
          {/* Password */}
          <label className="flex-0 w-1/4" htmlFor="user.password">
            Password
          </label>
          <input
            name="user.password"
            id="user.password"
            type="password"
            className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
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

        <div className="flex items-center h-10 max-w-xl">
          {/* Password confirmation */}
          <label className="flex-0 w-1/4" htmlFor="user.password_confirmation">
            Confirm Password
          </label>
          <input
            name="user.password_confirmation"
            id="user.password_confirmation"
            type="password"
            className="flex-1 appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
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
            value="Create User"
            className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
          />
        </div>
      </form>
    </>
  );
}
