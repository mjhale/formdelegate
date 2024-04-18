import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import { Lato } from 'next/font/google';
import Link from 'next/link';

const lato = Lato({
  weight: ['700', '900'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
});

async function verifyConfirmationToken(token) {
  const accessToken = cookies().get('access_token')?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/confirm?token=${token}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      if (data.error.type === 'INVALID_OR_EXPIRED_TOKEN') {
        return {
          message: (
            <>
              Your confirmation link is no longer valid. Please request a{' '}
              <Link
                href="/user-confirmation/request"
                className="underline font-semibold"
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
                className="underline font-semibold"
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
              className="underline font-semibold"
            >
              new confirmation link
            </Link>{' '}
            or{' '}
            <Link href="/support" className="underline font-semibold">
              contact support
            </Link>{' '}
            if the issue persists.
          </p>
        </>
      ),
    };
  }
}

export default async function UserConfirmationPage({ searchParams }) {
  const { token } = searchParams;

  if (!token) {
    return <>Please check your email for a verification request.</>;
  }

  const confirmation = await verifyConfirmationToken(token);

  return (
    <>
      <div className="flex justify-center align-middle items-center h-32 mb-4">
        <Link
          href="/"
          className={`block md:max-w-[4em] text-center text-2xl italic font-black no-underline text-neutral-100 ${lato.className} font-sans md:leading-8 md:text-5xl lowercase hover:text-white active:animate-scale-increase-fast`}
        >
          Form Delegate
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-6 text-black mb-4">
        {!!confirmation?.message && confirmation.message}
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Account Confirmation - Form Delegate',
  description: 'Confirm and secure your Form Delegate account.',
};
