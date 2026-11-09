import type { Metadata } from 'next';

import { cookies } from 'next/headers';

import ConfirmationRequestForm, {
  type ConfirmationRequestState,
} from './requestForm';

async function requestUserConfirmationLink(
  _previousState: ConfirmationRequestState,
  _formData: FormData
): Promise<ConfirmationRequestState> {
  'use server';

  try {
    const accessToken = (await cookies()).get('access_token')?.value;

    if (!accessToken) {
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
        body: JSON.stringify({}),
        method: 'POST',
      }
    );

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('Retry-After')) || 60;
      return {
        status: 'limited',
        retryAt: Date.now() + retryAfter * 1000,
        message:
          'Too many confirmation requests. Please wait before trying again.',
      };
    }

    if (!response.ok) {
      return {
        status: 'error',
        message: 'Unable to request a new confirmation link.',
      };
    }

    const payload = await response.json();
    if (payload.data?.status === 'already_verified') {
      return {
        status: 'verified',
        message:
          'Your email is already verified. No confirmation email is needed.',
      };
    }

    return {
      retryAt: Date.now() + (payload.data?.retry_after || 60) * 1000,
      status: 'success',
      message:
        payload.data?.status === 'already_queued'
          ? 'A confirmation email is already queued. Please check your inbox shortly.'
          : 'Got it! Please check your inbox for a new confirmation link.',
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
    <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
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
