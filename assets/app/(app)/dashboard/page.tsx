import type { SpamActivityDay } from './spamAnalysis';
import type { Metadata } from 'next';

import { Clock3, Inbox, ListChecks, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { getProfileContext } from 'utils/profile';

import AsyncPanelErrorBoundary from '../_components/asyncPanelErrorBoundary';
import { ButtonLink } from '../_components/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../_components/card';
import { DashboardSkeleton } from '../_components/skeletons';
import SpamAnalysis from './spamAnalysis';
import SubmissionActivity from './submissionActivity';

type ActivityDay = SpamActivityDay;

async function getDashboardData() {
  const { accessToken, selectedTeam } = await getProfileContext();
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  const [activityResponse, formsResponse] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/submissions/recent_activity`,
      { cache: 'no-store', headers }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/forms`,
      { cache: 'no-store', headers }
    ),
  ]);

  if (!activityResponse.ok) {
    throw new Error('Unable to load submission activity.');
  }

  const activityPayload = await activityResponse.json();
  const formsPayload = formsResponse.ok
    ? await formsResponse.json()
    : { data: [] };

  return {
    activity: (activityPayload.data || []) as ActivityDay[],
    formCount:
      formsResponse.ok && Array.isArray(formsPayload.data)
        ? formsPayload.data.length
        : null,
  };
}

export default async function DashboardPage() {
  return (
    <>
      <header className="mb-[25px] flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px] [&_h1]:mb-[7px] [&_h1]:ml-0 [&_h1]:mr-0 [&_h1]:mt-0 [&_h1]:text-[clamp(27px,_2.3vw,_34px)] [&_h1]:font-bold [&_h1]:leading-[1.15] [&_h1]:tracking-[-0.035em] [&_h1]:text-[#202126]">
        <div className="min-w-0">
          <p className="mb-1.5 ml-0 mr-0 mt-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#a33a34]">
            Workspace overview
          </p>
          <h1>Dashboard</h1>
          <p className="m-0 max-w-[660px] text-sm leading-[1.45] text-muted">
            Track incoming submissions, review your forms, and find useful
            workspace tools.
          </p>
        </div>
        <div className="flex flex-[0_0_auto] gap-[9px] max-lg:w-full max-lg:[&>a]:flex-1 max-lg:[&>button]:flex-1">
          <ButtonLink variant={'primary'} href="/forms/new">
            <Plus aria-hidden="true" />
            Create form
          </ButtonLink>
        </div>
      </header>

      <AsyncPanelErrorBoundary title="Unable to load dashboard activity.">
        <Suspense fallback={<DashboardFallback />}>
          <DashboardContent />
        </Suspense>
      </AsyncPanelErrorBoundary>
    </>
  );
}

async function DashboardContent() {
  await connection();
  const { activity, formCount } = await getDashboardData();
  const recentActivity = activity.slice(-30);
  const totalSubmissions = sumSubmissions(activity.slice(-240));
  const recentSubmissions = sumSubmissions(recentActivity);
  const latestSubmissionDay = [...activity]
    .reverse()
    .find((day) => Number(day.submission_count) > 0)?.day;

  return (
    <>
      <div className="mb-[18px] grid grid-cols-4 gap-[13px] max-[1120px]:grid-cols-2 max-[820px]:grid-cols-2 max-[820px]:gap-2.5 max-[520px]:grid-cols-1">
        <Metric
          icon={Inbox}
          label="Submissions · 240 days"
          note={`${recentSubmissions.toLocaleString()} in the last 30 days`}
          value={totalSubmissions.toLocaleString()}
        />
        <Metric
          icon={TrendingUp}
          label="Submissions · 30 days"
          note="Across the last 30 days"
          value={recentSubmissions.toLocaleString()}
        />
        <Metric
          icon={ListChecks}
          label="Forms"
          note={
            formCount === null
              ? 'Form count unavailable'
              : 'Available in this workspace'
          }
          value={formCount === null ? '—' : formCount.toLocaleString()}
        />
        <Metric
          icon={Clock3}
          label="Last submission"
          note={
            latestSubmissionDay
              ? formatDate(latestSubmissionDay)
              : 'No submissions yet'
          }
          value={
            latestSubmissionDay ? relativeDayLabel(latestSubmissionDay) : '—'
          }
        />
      </div>

      <div className="grid grid-cols-[minmax(0,_1.75fr)_minmax(290px,_0.82fr)] items-stretch gap-[18px] max-[1120px]:grid-cols-1 max-[1120px]:items-start">
        <SubmissionActivity activity={activity} />

        <>
          <SpamAnalysis activity={activity} />

          <Card className="col-span-full">
            <CardHeader>
              <div>
                <CardTitle>Product updates</CardTitle>
                <CardDescription>
                  What’s changed in Form Delegate.
                </CardDescription>
              </div>
            </CardHeader>
            <ul className="divide-y divide-[#e7e1d6]">
              <li className="grid items-start gap-3 px-5 py-5 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-5 sm:px-6">
                <span className="w-fit rounded-md border border-[#c9e5d9] bg-[#edf8f1] px-2 py-1 text-[11px] font-semibold text-[#2f7051]">
                  Added
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#303137]">
                    Self-service billing management
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Added a dedicated Billing page to review your plan and
                    usage, with access to the billing portal for subscription
                    management.
                  </p>
                  <Link
                    href="/account/billing"
                    className="mt-2 inline-block text-xs font-semibold text-brand-deep underline underline-offset-4"
                  >
                    View billing settings
                  </Link>
                </div>
              </li>
              <li className="grid items-start gap-3 px-5 py-5 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-5 sm:px-6">
                <span className="w-fit rounded-md border border-[#c9e5d9] bg-[#edf8f1] px-2 py-1 text-[11px] font-semibold text-[#2f7051]">
                  Added
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#303137]">
                    Per-form website restrictions
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Forms can now limit browser submissions to approved
                    hostnames, including wildcard subdomains. Configure allowed
                    websites in the form editor.
                  </p>
                  <Link
                    href="/forms"
                    className="mt-2 inline-block text-xs font-semibold text-brand-deep underline underline-offset-4"
                  >
                    View form settings
                  </Link>
                </div>
              </li>
            </ul>
          </Card>
        </>
      </div>
    </>
  );
}

function Metric({
  icon: MetricIcon,
  label,
  note,
  value,
}: {
  icon: typeof Inbox;
  label: string;
  note: string;
  value: string;
}) {
  return (
    <article className="min-h-[116px] rounded-lg border border-[#ded8cb] bg-[rgba(255,_254,_251,_0.92)] px-[18px] py-[17px] shadow-[0_1px_1px_rgba(51,_34,_24,_0.04)] max-[820px]:min-h-[108px] max-[820px]:p-[15px] max-[520px]:min-h-[94px]">
      <div className="flex items-center justify-between gap-2.5 text-xs font-semibold text-muted">
        <span>{label}</span>
        <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-brand-soft text-brand-deep [&_svg]:h-4 [&_svg]:w-4">
          <MetricIcon aria-hidden="true" />
        </span>
      </div>
      <div className="mt-3.5 text-[27px] font-bold leading-none tracking-[-0.04em] max-[820px]:text-2xl">
        {value}
      </div>
      <div className="mt-[7px] text-[11px] text-[#8d8e94]">{note}</div>
    </article>
  );
}

function DashboardFallback() {
  return <DashboardSkeleton />;
}

function sumSubmissions(activity: ActivityDay[]) {
  return activity.reduce(
    (total, day) => total + Math.max(0, Number(day.submission_count) || 0),
    0
  );
}

function relativeDayLabel(dateKey: string) {
  const date = parseDateKey(dateKey);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const difference = Math.max(
    0,
    Math.round((today.getTime() - date.getTime()) / 86_400_000)
  );

  if (difference === 0) return 'Today';
  if (difference === 1) return '1d';
  return `${difference}d`;
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseDateKey(dateKey));
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const metadata: Metadata = {
  title: 'Account Dashboard - Form Delegate',
  description: 'An overview of your Form Delegate account and service status.',
};
