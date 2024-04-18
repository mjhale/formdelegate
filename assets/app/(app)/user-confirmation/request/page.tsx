import type { Metadata } from 'next';

import { cookies } from 'next/headers';

async function fetchUser() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const userId = cookieStore.get('user_id')?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/${userId}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const { data } = await res.json();

  return data;
}

async function requestUserConfirmationLink(user) {
  const accessToken = cookies().get('access_token')?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/confirm`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        user: {
          email: user.email,
        },
      }),
      method: 'POST',
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return { message: 'Error: Unable to request new confirmation link.' };
  }

  return {
    message:
      'Got it! Please check your email inbox for a new confirmation link.',
  };
}

export default async function UserConfirmationRequestPage() {
  const user = await fetchUser();
  const confirmationLinkRequest = await requestUserConfirmationLink(user);

  return (
    <>{!!confirmationLinkRequest?.message && confirmationLinkRequest.message}</>
  );
}

export const metadata: Metadata = {
  title: 'Request New Confirmation Code - Form Delegate',
  description: 'Request a new confirmation code for your account.',
};
