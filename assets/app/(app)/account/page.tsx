import type { Metadata } from 'next';

import { Suspense } from 'react';

import { getProfileContext } from 'utils/profile';

import { AccountProfileSkeleton } from '../_components/skeletons';
import Profile from './profile';

export default async function AccountProfilePage() {
  return (
    <Suspense fallback={<AccountProfileSkeleton />}>
      <AccountProfileContent />
    </Suspense>
  );
}

async function AccountProfileContent() {
  const { profile } = await getProfileContext();

  return <Profile user={profile.user} />;
}

export const metadata: Metadata = {
  title: 'Manage Account - Form Delegate',
  description: 'Manage your Form Delegate account details.',
};
