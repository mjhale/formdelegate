import type { Metadata } from 'next';

import { Suspense } from 'react';
import Link from 'next/link';

import {
  InvitationAccountSwitchLink,
  TeamInvitationAuthContext,
} from '_components/teamInvitationAuthContext';
import {
  isInvitationAcceptanceDestination,
  safeRedirectPath,
} from 'utils/destination';

import LoginForm from './form';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const { destination } = await searchParams;
  const safeDestination = safeRedirectPath(destination, '');
  const isInvitationLogin = isInvitationAcceptanceDestination(safeDestination);
  const signupHref = safeDestination
    ? `/signup?${new URLSearchParams({ destination: safeDestination }).toString()}`
    : '/signup';
  const resetHref = isInvitationLogin
    ? `/reset-password?${new URLSearchParams({ destination: safeDestination }).toString()}`
    : '/reset-password';

  return (
    <>
      <div className="flex justify-center align-middle items-center h-32 mb-4">
        <Link
          href="/"
          className="block max-w-40 text-center text-4xl leading-7 italic font-black no-underline text-neutral-100 [font-family:var(--font-lato)] md:max-w-[4em] md:leading-8 md:text-5xl lowercase hover:text-white active:animate-scale-increase-fast"
        >
          Form Delegate
        </Link>
      </div>
      <div className="bg-white border rounded-md p-6 text-black mx-4 md:mx-0 md:rounded-lg">
        {isInvitationLogin ? (
          <TeamInvitationAuthContext action="login" className="mb-5" />
        ) : (
          <h1 className="text-2xl font-light text-center mb-4">Sign In</h1>
        )}
        <LoginForm
          destination={safeDestination}
          submitLabel={isInvitationLogin ? 'Sign in to accept' : 'Login'}
        />
        {isInvitationLogin ? (
          <p className="mx-auto max-w-xs pt-4 text-right text-sm text-slate-600">
            Forgot your password?{' '}
            <Link href={resetHref} className="font-semibold underline">
              Reset it
            </Link>
            , then return to this invitation.
          </p>
        ) : (
          <div className="flex justify-end max-w-xs mx-auto pt-4">
            <Link href={resetHref} className="font-semibold text-sm">
              Need help?
            </Link>
          </div>
        )}
      </div>
      {isInvitationLogin ? (
        <InvitationAccountSwitchLink
          href={signupHref}
          label="Need a Form Delegate account for this invitation?"
          linkText="Create one instead"
        />
      ) : (
        <div className="flex justify-center text-sm text-gray-800 font-medium mt-4">
          Don't have an account?
          <Link href={signupHref} className="pl-1 underline">
            Sign up
          </Link>
        </div>
      )}
    </>
  );
}

function LoginPageFallback() {
  return (
    <>
      <div className="flex h-32 items-center justify-center mb-4">
        <span className="block max-w-40 text-center text-4xl leading-7 italic font-black text-neutral-100 [font-family:var(--font-lato)] md:max-w-[4em] md:leading-8 md:text-5xl lowercase">
          Form Delegate
        </span>
      </div>
      <div className="mx-4 rounded-md border bg-white p-6 text-black md:mx-0 md:rounded-lg">
        <div className="mx-auto h-7 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mx-auto mt-6 h-40 max-w-xs animate-pulse rounded bg-slate-100" />
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Log In - Form Delegate',
  description: 'Log in to the Form Delegate service and manage your forms.',
};
