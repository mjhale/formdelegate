import type { Metadata } from 'next';

import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';

import type {
  BillingCountUsage,
  BillingStorageUsage,
  BillingUsage,
  BillingUsageStatus,
} from 'types/user';
import { plansCacheTag } from 'utils/cacheTags';
import { getProfileContext } from 'utils/profile';

import { BillingSkeleton } from '../../_components/skeletons';

import StripePortalButton from './stripePortalButton';
import PlanSubscribeButton from './planSubscribeButton';

async function fetchPlans() {
  'use cache: private';
  cacheLife('hours');
  cacheTag(plansCacheTag);

  const { accessToken } = await getProfileContext();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/plans`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Unable to fetch plans.');
  }

  const { data } = await res.json();

  return data;
}

async function fetchBillingUsage(
  accessToken: string,
  teamId: string
): Promise<BillingUsage> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${teamId}/billing/usage`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Unable to fetch billing usage.');
  }

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
  const profileContextPromise = getProfileContext();
  const plansPromise = fetchPlans();
  const { accessToken, profile, selectedTeam } = await profileContextPromise;
  const [plans, billingUsage] = await Promise.all([
    plansPromise,
    fetchBillingUsage(accessToken, selectedTeam.id),
  ]);

  let currentSubscriptionPlanId = billingUsage.plan?.id;

  if (!currentSubscriptionPlanId) {
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

      <BillingUsageOverview billingUsage={billingUsage} />

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

function BillingUsageOverview({
  billingUsage,
}: {
  billingUsage: BillingUsage;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Current Usage</h2>
          <p className="text-sm text-gray-500">
            {billingUsage.plan.name} plan · period ends{' '}
            {formatDate(billingUsage.period.ended_at)}
          </p>
        </div>
        <StatusBadge status={overallStatus(billingUsage)} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UsagePanel label="Forms" usage={billingUsage.usage.forms} />
        <UsagePanel
          label="Submissions"
          usage={billingUsage.usage.submissions}
        />
        <StorageUsagePanel usage={billingUsage.usage.storage} />
      </div>
    </section>
  );
}

function UsagePanel({
  label,
  usage,
}: {
  label: string;
  usage: BillingCountUsage;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{label}</h3>
        <StatusBadge status={usage.status} />
      </div>
      <div className="text-2xl font-semibold text-gray-900">
        {usage.used.toLocaleString()}
      </div>
      <p className="mt-1 text-sm text-gray-500">{limitLabel(usage)}</p>
      <UsageBar usage={usage} />
    </div>
  );
}

function StorageUsagePanel({ usage }: { usage: BillingStorageUsage }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">Storage</h3>
        <StatusBadge status={usage.status} />
      </div>
      <div className="text-2xl font-semibold text-gray-900">
        {formatBytes(usage.used_bytes)}
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {formatBytes(usage.limit_bytes)} included · grace at{' '}
        {formatBytes(usage.grace_limit_bytes)}
      </p>
      <UsageBar
        usage={{
          grace_limit: usage.grace_limit_bytes,
          limit: usage.limit_bytes,
          status: usage.status,
          used: usage.used_bytes,
        }}
      />
    </div>
  );
}

function UsageBar({ usage }: { usage: BillingCountUsage }) {
  if (usage.status === 'unlimited' || !usage.grace_limit) {
    return <div className="mt-4 h-2 rounded-full bg-gray-100" />;
  }

  const width = Math.min((usage.used / usage.grace_limit) * 100, 100);

  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full ${statusFillClass(usage.status)}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: BillingUsageStatus }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-medium ${statusBadgeClass(
        status
      )}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function overallStatus(billingUsage: BillingUsage): BillingUsageStatus {
  const statuses = [
    billingUsage.usage.forms.status,
    billingUsage.usage.submissions.status,
    billingUsage.usage.storage.status,
  ];

  if (statuses.includes('blocked')) return 'blocked';
  if (statuses.includes('over_limit')) return 'over_limit';
  if (statuses.includes('warning')) return 'warning';
  return 'ok';
}

function limitLabel(usage: BillingCountUsage) {
  if (usage.status === 'unlimited') {
    return 'Unlimited on this plan';
  }

  const graceLimit = usage.grace_limit?.toLocaleString() ?? '-';

  return `${usage.limit.toLocaleString()} included · grace at ${graceLimit}`;
}

function statusLabel(status: BillingUsageStatus) {
  switch (status) {
    case 'blocked':
      return 'Blocked';
    case 'over_limit':
      return 'Over limit';
    case 'warning':
      return 'Warning';
    case 'unlimited':
      return 'Unlimited';
    default:
      return 'Ok';
  }
}

function statusBadgeClass(status: BillingUsageStatus) {
  switch (status) {
    case 'blocked':
      return 'bg-red-50 text-red-700 ring-1 ring-red-200';
    case 'over_limit':
      return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200';
    case 'warning':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    case 'unlimited':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    default:
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  }
}

function statusFillClass(status: BillingUsageStatus) {
  switch (status) {
    case 'blocked':
      return 'bg-red-500';
    case 'over_limit':
      return 'bg-orange-500';
    case 'warning':
      return 'bg-amber-500';
    default:
      return 'bg-emerald-500';
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function formatBytes(value: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let amount = value;
  let unitIndex = 0;

  while (amount >= 1000 && unitIndex < units.length - 1) {
    amount = amount / 1000;
    unitIndex += 1;
  }

  return `${amount.toLocaleString('en', {
    maximumFractionDigits: amount >= 10 || unitIndex === 0 ? 0 : 1,
  })} ${units[unitIndex]}`;
}

export const metadata: Metadata = {
  title: 'Manage Billing and Subscription Details - Form Delegate',
  description:
    'Manage your Form Delegate billing and subscription information.',
};
