import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';

import { invitationAcceptancePath, safeRedirectPath } from 'utils/destination';

import {
  InvitationAuthActions,
  TeamInvitationAuthContext,
} from '_components/teamInvitationAuthContext';
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
    <div className="mx-4 rounded-md border bg-white p-6 text-black md:mx-0 md:rounded-lg">
      {!token ? (
        <>
          <h1 className="mb-4 text-center text-2xl font-light">
            Team Invitation
          </h1>
          <p className="text-center text-sm text-slate-700">
            Invitation link is missing.
          </p>
        </>
      ) : isSignedIn ? (
        <>
          <h1 className="mb-4 text-center text-2xl font-light">
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
    <div className="mb-4 flex h-32 items-center justify-center align-middle">
      <Link
        href="/"
        className="block max-w-40 text-center text-4xl font-black lowercase italic leading-7 text-neutral-100 no-underline [font-family:var(--font-lato)] hover:text-white active:animate-scale-increase-fast md:max-w-[4em] md:text-5xl md:leading-8"
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
