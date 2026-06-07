import type { Metadata } from 'next';

import { Suspense } from 'react';
import { cookies } from 'next/headers';

import { AccountProfileSkeleton } from '../_components/skeletons';

import Profile from './profile';

async function fetchUser() {
  const cookieStore = await cookies();
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

export default async function AccountProfilePage() {
  return (
    <Suspense fallback={<AccountProfileSkeleton />}>
      <AccountProfileContent />
    </Suspense>
  );
}

async function AccountProfileContent() {
  const user = await fetchUser();

  return <Profile user={user} />;
}

export const metadata: Metadata = {
  title: 'Manage Account - Form Delegate',
  description: 'Manage your Form Delegate account details.',
};
