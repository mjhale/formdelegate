import type { Metadata } from 'next';
import type {
  BillingCountUsage,
  BillingStorageUsage,
  BillingUsage,
  BillingUsageStatus,
} from 'types/user';

import { cacheLife, cacheTag } from 'next/cache';
import { Suspense } from 'react';

import { plansCacheTag } from 'utils/cacheTags';
import { getProfileContext } from 'utils/profile';

import AccountNav from '../../_components/accountNav';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../_components/card';
import { BillingSkeleton } from '../../_components/skeletons';
import PlanSubscribeButton from './planSubscribeButton';
import StripePortalButton from './stripePortalButton';

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

  if (!res.ok) throw new Error('Unable to fetch plans.');
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

  if (!res.ok) throw new Error('Unable to fetch billing usage.');
  const { data } = await res.json();
  return data;
}

export default async function BillingPage() {
  return (
    <Suspense fallback={<BillingFallback />}>
      <BillingContent />
    </Suspense>
  );
}

async function BillingContent() {
  const { accessToken, profile, selectedTeam } = await getProfileContext();
  const [plans, billingUsage] = await Promise.all([
    fetchPlans(),
    fetchBillingUsage(accessToken, selectedTeam.id),
  ]);

  let currentSubscriptionPlanId = billingUsage.plan?.id;
  if (!currentSubscriptionPlanId) {
    currentSubscriptionPlanId = plans.find((plan) => plan.name === 'Free')?.id;
  }

  const sortedPlans = [...plans].sort((a, b) =>
    a.limit_submissions > b.limit_submissions ? 1 : -1
  );

  return (
    <>
      <header className="mb-[18px] flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px] [&_h1]:mb-[7px] [&_h1]:ml-0 [&_h1]:mr-0 [&_h1]:mt-0 [&_h1]:text-[clamp(27px,_2.3vw,_34px)] [&_h1]:font-bold [&_h1]:leading-[1.15] [&_h1]:tracking-[-0.035em] [&_h1]:text-[#202126]">
        <div className="min-w-0">
          <p className="mb-1.5 ml-0 mr-0 mt-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#a33a34]">
            Subscription
          </p>
          <h1>Billing</h1>
          <p className="m-0 max-w-[660px] text-sm leading-[1.45] text-muted">
            Review your plan, usage, and payment settings.
          </p>
        </div>
      </header>

      <AccountNav />

      <Card className="[&+section]:mt-[18px]">
        <CardHeader>
          <div>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>
              {billingUsage.plan.name} plan · period ends{' '}
              {formatDate(billingUsage.period.ended_at)}.
            </CardDescription>
          </div>
          <StatusBadge status={overallStatus(billingUsage)} />
        </CardHeader>

        <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
          <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
            <strong>Plan</strong>
            <p>Your current workspace subscription.</p>
          </div>
          <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
            <strong>{billingUsage.plan.name}</strong>
          </div>
          <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1">
            <StripePortalButton />
          </div>
        </div>

        <UsageSettingsRow label="Forms" usage={billingUsage.usage.forms} />
        <UsageSettingsRow
          label="Monthly submissions"
          usage={billingUsage.usage.submissions}
        />
        <StorageSettingsRow usage={billingUsage.usage.storage} />
      </Card>

      <Card className="[&+section]:mt-[18px]">
        <CardHeader>
          <div>
            <CardTitle>Available plans</CardTitle>
            <CardDescription>
              Compare workspace limits and change plans when you need more
              capacity.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-0">
          {sortedPlans.map((plan) => (
            <div
              className="grid min-h-[86px] grid-cols-[minmax(170px,_0.8fr)_minmax(260px,_1.45fr)_128px] items-center gap-5 border-t border-t-[#e5ded3] px-[18px] py-4 first:border-t-0 max-[820px]:grid-cols-[1fr_auto]"
              key={plan.id}
            >
              <div className="[&_span]:mt-[3px] [&_span]:block [&_span]:text-[10px] [&_span]:text-muted [&_strong]:block [&_strong]:text-[13px]">
                <strong>{plan.name}</strong>
                <span>
                  {plan.id === currentSubscriptionPlanId
                    ? 'Current plan'
                    : 'Available plan'}
                </span>
              </div>
              <div className="grid min-w-0 grid-cols-[minmax(0,_0.8fr)_minmax(0,_1.3fr)_minmax(0,_1fr)] gap-[6px_12px] text-[11px] text-muted [font-variant-numeric:tabular-nums] max-[820px]:col-span-full max-[820px]:row-start-2">
                <span>
                  {plan.limit_forms === 0 ? 'Unlimited' : plan.limit_forms}{' '}
                  forms
                </span>
                <span>
                  {plan.limit_submissions.toLocaleString()} submissions
                </span>
                <span>{formatBytes(plan.limit_storage)} storage</span>
              </div>
              <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1">
                <PlanSubscribeButton
                  currentSubscriptionPlanId={currentSubscriptionPlanId}
                  plan={plan}
                  user={profile.user}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function UsageSettingsRow({
  label,
  usage,
}: {
  label: string;
  usage: BillingCountUsage;
}) {
  const width = usage.limit
    ? Math.min((usage.used / usage.limit) * 100, 100)
    : 0;

  return (
    <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
      <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
        <strong>{label}</strong>
        <p>{limitLabel(usage)}</p>
      </div>
      <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
        {usage.used.toLocaleString()} used
        <div
          aria-hidden="true"
          className="mt-2 h-1.5 overflow-hidden rounded-[999px] bg-[#efe9df] [&_>_span]:block [&_>_span]:h-full [&_>_span]:rounded-[inherit] [&_>_span]:bg-brand"
        >
          <span style={{ width: `${width}%` }} />
        </div>
      </div>
      <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1">
        <StatusBadge status={usage.status} />
      </div>
    </div>
  );
}

function StorageSettingsRow({ usage }: { usage: BillingStorageUsage }) {
  const width = usage.limit_bytes
    ? Math.min((usage.used_bytes / usage.limit_bytes) * 100, 100)
    : 0;

  return (
    <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
      <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
        <strong>Storage</strong>
        <p>{formatBytes(usage.limit_bytes)} included</p>
      </div>
      <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
        {formatBytes(usage.used_bytes)} used
        <div
          aria-hidden="true"
          className="mt-2 h-1.5 overflow-hidden rounded-[999px] bg-[#efe9df] [&_>_span]:block [&_>_span]:h-full [&_>_span]:rounded-[inherit] [&_>_span]:bg-brand"
        >
          <span style={{ width: `${width}%` }} />
        </div>
      </div>
      <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1">
        <StatusBadge status={usage.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BillingUsageStatus }) {
  if (status === 'ok') return null;
  const success = status === 'unlimited';
  return (
    <span
      className={` inline-flex w-[fit-content] items-center gap-[5px] [padding:3px_7px] text-[color:#6f2421] [border:1px_solid_#efc2bc] rounded-[999px] bg-[#fff4f1] text-[10px] font-[750] ${success ? '' : ''}`}
      title={statusLabel(status)}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-[currentColor]" />
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
  if (usage.status === 'unlimited') return 'Unlimited on this plan';
  return `${usage.limit.toLocaleString()} included`;
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
      return '';
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
    new Date(value)
  );
}

function formatBytes(value: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let amount = value;
  let unitIndex = 0;

  while (amount >= 1000 && unitIndex < units.length - 1) {
    amount /= 1000;
    unitIndex += 1;
  }

  return `${amount.toLocaleString('en-US', {
    maximumFractionDigits: amount >= 10 || unitIndex === 0 ? 0 : 1,
  })} ${units[unitIndex]}`;
}

function BillingFallback() {
  return <BillingSkeleton />;
}

export const metadata: Metadata = {
  title: 'Manage Billing and Subscription Details - Form Delegate',
  description:
    'Manage your Form Delegate billing and subscription information.',
};
