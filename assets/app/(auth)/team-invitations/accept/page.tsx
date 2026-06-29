import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import { Lato } from 'next/font/google';
import Link from 'next/link';

import { invitationAcceptancePath, safeRedirectPath } from 'utils/destination';

import AcceptInvitationForm from './acceptInvitationForm';

const lato = Lato({
  weight: ['700', '900'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
});

export default async function AcceptTeamInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const cookieStore = await cookies();
  const isSignedIn =
    Boolean(cookieStore.get('access_token')?.value) &&
    Boolean(cookieStore.get('user_id')?.value);

  const destination = token
    ? safeRedirectPath(invitationAcceptancePath(token), '')
    : '';

  return (
    <>
      <div className="flex justify-center align-middle items-center h-32 mb-4">
        <Link
          href="/"
          className={`block max-w-40 text-center text-4xl leading-7 italic font-black no-underline text-neutral-100 ${lato.className} font-sans md:max-w-[4em] md:leading-8 md:text-5xl lowercase hover:text-white active:animate-scale-increase-fast`}
        >
          Form Delegate
        </Link>
      </div>

      <div className="bg-white border rounded-md p-6 text-black mx-4 md:mx-0 md:rounded-lg">
        <h1 className="text-2xl font-light text-center mb-4">
          Team Invitation
        </h1>

        {!token ? (
          <p className="text-center text-sm text-slate-700">
            Invitation link is missing.
          </p>
        ) : isSignedIn ? (
          <AcceptInvitationForm token={token} />
        ) : (
          <SignedOutInvitation destination={destination} />
        )}
      </div>
    </>
  );
}

function SignedOutInvitation({ destination }: { destination: string }) {
  const destinationParams = new URLSearchParams({ destination }).toString();

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm text-slate-700">
        Sign in or create an account to accept this team invitation.
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href={`/login?${destinationParams}`}
          className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
        >
          Sign in
        </Link>
        <Link
          href={`/signup?${destinationParams}`}
          className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Accept Team Invitation - Form Delegate',
  description: 'Accept a Form Delegate team invitation.',
};
