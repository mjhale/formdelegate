import type { Metadata } from 'next';

import { cookies } from 'next/headers';

import { getProfileContext } from 'utils/profile';

import ConfirmationRequestForm, {
  type ConfirmationRequestState,
} from './requestForm';

async function requestUserConfirmationLink(
  _previousState: ConfirmationRequestState,
  _formData: FormData
): Promise<ConfirmationRequestState> {
  'use server';

  try {
    const [{ profile }, cookieStore] = await Promise.all([
      getProfileContext(),
      cookies(),
    ]);
    const accessToken = cookieStore.get('access_token')?.value;
    const email = profile?.user?.email;

    if (!accessToken || !email) {
      return {
        status: 'error',
        message: 'Unable to request a new confirmation link.',
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/confirm`,
      {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ user: { email } }),
        method: 'POST',
      }
    );

    if (!response.ok) {
      return {
        status: 'error',
        message: 'Unable to request a new confirmation link.',
      };
    }

    return {
      status: 'success',
      message:
        'Got it! Please check your email inbox for a new confirmation link.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Unable to request a new confirmation link.',
    };
  }
}

export default function UserConfirmationRequestPage() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">
        Request a new confirmation link
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        We can send another account confirmation link to the email address on
        your profile.
      </p>
      <ConfirmationRequestForm action={requestUserConfirmationLink} />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Request New Confirmation Code - Form Delegate',
  description: 'Request a new confirmation code for your account.',
};
