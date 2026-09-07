import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';

async function verifyConfirmationToken(token: string) {
  const accessToken = (await cookies()).get('access_token')?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/confirm?token=${token}`,
      {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      if (data?.error?.type === 'INVALID_OR_EXPIRED_TOKEN') {
        return {
          message: (
            <>
              Your confirmation link is no longer valid. Please request a{' '}
              <Link
                href="/user-confirmation/request"
                className="font-semibold underline"
              >
                new confirmation link
              </Link>
              .
            </>
          ),
        };
      } else {
        return {
          message: (
            <>
              Error: Unable to verify your confirmation link. Please request a{' '}
              <Link
                href="/user-confirmation/request"
                className="font-semibold underline"
              >
                new confirmation link
              </Link>
              .
            </>
          ),
        };
      }
    }

    return { message: <p>You've confirmed your account!</p> };
  } catch (e) {
    return {
      message: (
        <>
          <p>
            Unable to confirm account. Please request a{' '}
            <Link
              href="/user-confirmation/request"
              className="font-semibold underline"
            >
              new confirmation link
            </Link>{' '}
            or{' '}
            <Link href="/support" className="font-semibold underline">
              contact support
            </Link>{' '}
            if the issue persists.
          </p>
        </>
      ),
    };
  }
}

export default function UserConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <>
      <BrandLink />
      <Suspense fallback={<ConfirmationFallback />}>
        <ConfirmationContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ConfirmationContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <>Please check your email for a verification request.</>;
  }

  const confirmation = await verifyConfirmationToken(token);

  return (
    <div className="mb-4 rounded-lg border bg-white p-6 text-black">
      {!!confirmation?.message && confirmation.message}
    </div>
  );
}

function BrandLink() {
  return (
    <div className="mb-4 flex h-32 items-center justify-center align-middle">
      <Link
        href="/"
        className="block text-center text-2xl font-black lowercase italic text-neutral-100 no-underline [font-family:var(--font-lato)] hover:text-white active:animate-scale-increase-fast md:max-w-[4em] md:text-5xl md:leading-8"
      >
        Form Delegate
      </Link>
    </div>
  );
}

function ConfirmationFallback() {
  return (
    <div className="mb-4 h-24 animate-pulse rounded-lg border bg-white/90" />
  );
}

export const metadata: Metadata = {
  title: 'Account Confirmation - Form Delegate',
  description: 'Confirm and secure your Form Delegate account.',
};
