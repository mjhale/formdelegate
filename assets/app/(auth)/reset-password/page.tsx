import type { Metadata } from 'next';

import Link from 'next/link';
import { Suspense } from 'react';

import {
  isInvitationAcceptanceDestination,
  safeRedirectPath,
} from 'utils/destination';

import ResetPassword from './resetPassword';
import ResetRequest from './resetRequest';

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
      <div className="mb-4 flex h-32 items-center justify-center align-middle">
        <Link
          href="/"
          className="block text-center text-2xl font-black lowercase italic text-neutral-100 no-underline [font-family:var(--font-lato)] hover:text-white active:animate-scale-increase-fast md:max-w-[4em] md:text-5xl md:leading-8"
        >
          Form Delegate
        </Link>
      </div>
      <div className="mb-4 rounded-lg border bg-white p-6 text-black">
        {token ? (
          <ResetPassword token={token} />
        ) : (
          <ResetRequest isInvitationReset={isInvitationReset} />
        )}
      </div>
      <div className="flex justify-center text-sm font-medium text-gray-800">
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
      <div className="mb-4 flex h-32 items-center justify-center">
        <span className="text-center text-2xl font-black lowercase italic text-neutral-100 [font-family:var(--font-lato)] md:max-w-[4em] md:text-5xl md:leading-8">
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
