import type { Metadata } from 'next';

import { Suspense } from 'react';

import { getProfileContext } from 'utils/profile';

import { DashboardSkeleton } from '../_components/skeletons';

import SubmissionActivity from './submissionActivity';

async function getSubmissionActivity() {
  const { accessToken, selectedTeam } = await getProfileContext();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/submissions/recent_activity`,
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

export default async function DashboardPage() {
  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        my Dashboard
      </h1>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

async function DashboardContent() {
  const submissionActivity = await getSubmissionActivity();

  return (
    <div className="flex flex-col gap-y-4">
      <SubmissionActivity activity={submissionActivity} />

      <div className="border border-grey-600 rounded-t">
        <div className="bg-carnation-400 text-white rounded-t border-stone-200 block text-sm font-semibold leading-6 p-2 uppercase">
          Recent Updates
        </div>
        <div className="p-2 bg-white rounded-lg">
          Billing management has been added to the account page.
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Account Dashboard - Form Delegate',
  description: 'An overview of your Form Delegate account and service status.',
};
