import type { Metadata } from 'next';

import { cookies } from 'next/headers';

import SubmissionActivity from './submissionActivity';

async function getSubmissionActivity() {
  const accessToken = cookies().get('access_token')?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/submissions/recent_activity`,
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
  const submissionActivity = await getSubmissionActivity();

  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        my Dashboard
      </h1>

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
    </>
  );
}

export const metadata: Metadata = {
  title: 'Account Dashboard - Form Delegate',
  description: 'An overview of your Form Delegate account and service status.',
};
