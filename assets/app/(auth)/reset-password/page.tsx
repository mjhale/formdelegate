import type { Metadata } from 'next';

import { Suspense } from 'react';
import Link from 'next/link';

import {
  isInvitationAcceptanceDestination,
  safeRedirectPath,
} from 'utils/destination';

import ResetRequest from './resetRequest';
import ResetPassword from './resetPassword';

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string; token?: string }>;
}) {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPasswordContent({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string; token?: string }>;
}) {
  const { destination, token } = await searchParams;
  const safeDestination = safeRedirectPath(destination, '');
  const isInvitationReset = isInvitationAcceptanceDestination(safeDestination);
  const signupHref = isInvitationReset
    ? `/signup?${new URLSearchParams({ destination: safeDestination }).toString()}`
    : '/signup';

  return (
    <>
      <div className="flex justify-center align-middle items-center h-32 mb-4">
        <Link
          href="/"
          className="block md:max-w-[4em] text-center text-2xl italic font-black no-underline text-neutral-100 [font-family:var(--font-lato)] md:leading-8 md:text-5xl lowercase hover:text-white active:animate-scale-increase-fast"
        >
          Form Delegate
        </Link>
      </div>
      <div className="bg-white border rounded-lg p-6 text-black mb-4">
        {token ? (
          <ResetPassword token={token} />
        ) : (
          <ResetRequest isInvitationReset={isInvitationReset} />
        )}
      </div>
      <div className="flex justify-center text-sm text-gray-800 font-medium">
        Don't have an account?
        <Link href={signupHref} className="pl-1 underline">
          Sign up
        </Link>
      </div>
    </>
  );
}

function ResetPasswordFallback() {
  return (
    <>
      <div className="flex h-32 items-center justify-center mb-4">
        <span className="text-center text-2xl italic font-black text-neutral-100 [font-family:var(--font-lato)] md:max-w-[4em] md:leading-8 md:text-5xl lowercase">
          Form Delegate
        </span>
      </div>
      <div className="mb-4 h-64 animate-pulse rounded-lg border bg-white/90" />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Reset Password - Form Delegate',
  description:
    'Forgot your password? Reset it or contact support for additional help.',
};
