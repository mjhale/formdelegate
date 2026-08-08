import type { Metadata } from 'next';

import { Suspense } from 'react';

import {
  InvitationAccountSwitchLink,
  TeamInvitationAuthContext,
} from '_components/teamInvitationAuthContext';
import {
  isInvitationAcceptanceDestination,
  safeRedirectPath,
} from 'utils/destination';

import SignupForm from './form';

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  return (
    <Suspense fallback={<SignupPageFallback />}>
      <SignupPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SignupPageContent({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const { destination } = await searchParams;
  const safeDestination = safeRedirectPath(destination, '');
  const isInvitationSignup = isInvitationAcceptanceDestination(safeDestination);
  const loginHref = safeDestination
    ? `/login?${new URLSearchParams({ destination: safeDestination }).toString()}`
    : '/login';

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl">
          {isInvitationSignup ? (
            <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <TeamInvitationAuthContext action="signup" className="mb-5" />
              <SignupForm
                destination={safeDestination}
                submitLabel="Create account to accept"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl lowercase tracking-wide font-semibold">
                Sign Up for Form Delegate
              </h1>

              <SignupForm destination={safeDestination} />
            </>
          )}
        </div>
        {isInvitationSignup && (
          <InvitationAccountSwitchLink
            href={loginHref}
            label="Already have the invited email on an account?"
            linkText="Sign in instead"
          />
        )}
      </div>
    </>
  );
}

function SignupPageFallback() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-4xl flex-col gap-y-4">
        <div className="h-9 w-72 animate-pulse rounded bg-slate-200" />
        <div className="h-96 w-full max-w-xl animate-pulse rounded-lg bg-white" />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Create an Account - Form Delegate',
  description:
    'Sign up for Form Delegate with no credit card required and start processing your HTML forms for free.',
};
