import type { Metadata } from 'next';

import { safeRedirectPath } from 'utils/destination';

import SignupForm from './form';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const { destination } = await searchParams;
  const safeDestination = safeRedirectPath(destination, '');

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl">
          <h1 className="text-3xl lowercase tracking-wide font-semibold">
            Sign Up for Form Delegate
          </h1>

          <SignupForm destination={safeDestination} />
        </div>
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Create an Account - Form Delegate',
  description:
    'Sign up for Form Delegate with no credit card required and start processing your HTML forms for free.',
};
