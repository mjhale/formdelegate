import type { Metadata } from 'next';

import { Suspense } from 'react';
import { cookies } from 'next/headers';

import { getProfileContext } from 'utils/profile';

import { BillingSkeleton } from '../../_components/skeletons';

import StripePortalButton from './stripePortalButton';
import PlanSubscribeButton from './planSubscribeButton';

async function fetchPlans() {
  const accessToken = (await cookies()).get('access_token')?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/plans`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { data } = await res.json();

  return data;
}

export default async function BillingPage() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingContent />
    </Suspense>
  );
}

async function BillingContent() {
  const [{ profile, selectedTeam }, plans] = await Promise.all([
    getProfileContext(),
    fetchPlans(),
  ]);

  // Retrieve team subscription plan (assuming one active plan per team)
  let currentSubscriptionPlanId = selectedTeam.subscriptions[0]?.plan?.id;

  if (currentSubscriptionPlanId === undefined) {
    currentSubscriptionPlanId = plans.find((plan) => plan.name === 'Free').id;
  }

  const sortedPlansBySubmissions = [...plans].sort((a, b) =>
    a.limit_submissions > b.limit_submissions ? 1 : -1
  );

  return (
    <>
      <h1 className="text-3xl lowercase tracking-wide font-semibold mb-4">
        Billing Overview
      </h1>

      <hr className="bg-slate-100 mb-5" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {sortedPlansBySubmissions.map((plan) => (
          <div className="rounded-lg bg-white border shadow-lg" key={plan.id}>
            <div className="flex flex-col p-4">
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
            </div>
            <div className="pl-10">
              <ul className="list-disc space-y-2">
                <li>
                  {plan.limit_forms === 0 ? 'Unlimited' : plan.limit_forms}{' '}
                  forms
                </li>
                <li>{plan.limit_submissions.toLocaleString()} submissions</li>
                <li>
                  {(plan.limit_storage / Math.pow(1000, 3)).toLocaleString()} GB
                  storage
                </li>
              </ul>
            </div>
            <div className="items-center p-4 flex justify-center">
              <PlanSubscribeButton
                plan={plan}
                user={profile.user}
                currentSubscriptionPlanId={currentSubscriptionPlanId}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <StripePortalButton />
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Manage Billing and Subscription Details - Form Delegate',
  description:
    'Manage your Form Delegate billing and subscription information.',
};
