import type { Metadata } from 'next';

import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';

import {
  InvitationAuthActions,
  TeamInvitationAuthContext,
} from '_components/teamInvitationAuthContext';
import { invitationAcceptancePath, safeRedirectPath } from 'utils/destination';

import AcceptInvitationForm from './acceptInvitationForm';

export default function AcceptTeamInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <>
      <BrandLink />
      <Suspense fallback={<InvitationFallback />}>
        <InvitationContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function InvitationContent({
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
    <div className="bg-white border rounded-md p-6 text-black mx-4 md:mx-0 md:rounded-lg">
      {!token ? (
        <>
          <h1 className="text-2xl font-light text-center mb-4">
            Team Invitation
          </h1>
          <p className="text-center text-sm text-slate-700">
            Invitation link is missing.
          </p>
        </>
      ) : isSignedIn ? (
        <>
          <h1 className="text-2xl font-light text-center mb-4">
            Team Invitation
          </h1>
          <AcceptInvitationForm token={token} />
        </>
      ) : (
        <SignedOutInvitation destination={destination} />
      )}
    </div>
  );
}

function BrandLink() {
  return (
    <div className="flex justify-center align-middle items-center h-32 mb-4">
      <Link
        href="/"
        className="block max-w-40 text-center text-4xl leading-7 italic font-black no-underline text-neutral-100 [font-family:var(--font-lato)] md:max-w-[4em] md:leading-8 md:text-5xl lowercase hover:text-white active:animate-scale-increase-fast"
      >
        Form Delegate
      </Link>
    </div>
  );
}

function InvitationFallback() {
  return (
    <div className="mx-4 h-52 animate-pulse rounded-md border bg-white/90 md:mx-0 md:rounded-lg" />
  );
}

function SignedOutInvitation({ destination }: { destination: string }) {
  const destinationParams = new URLSearchParams({ destination }).toString();

  return (
    <div className="space-y-5">
      <TeamInvitationAuthContext action="accept" />
      <InvitationAuthActions
        loginHref={`/login?${destinationParams}`}
        signupHref={`/signup?${destinationParams}`}
      />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Accept Team Invitation - Form Delegate',
  description: 'Accept a Form Delegate team invitation.',
};
