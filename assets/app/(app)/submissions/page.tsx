import type { SubmissionsSearchParams } from './filterParams';
import type { FormFilterMetadata } from './formFilterSummary';
import type { Metadata } from 'next';
import type { ProfileContext } from 'utils/profile';

import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { Suspense } from 'react';

import {
  buildSubmissionApiSearchParams,
  parseSubmissionFormIds,
} from './filterParams';
import { formFilterSummary } from './formFilterSummary';
import {
  INVALID_FORM_FILTER,
  numericPaginationHeader,
  submissionApiErrorType,
  submissionFilterRecoveryHref,
} from './submissionResponse';
import { formsCacheTag } from 'utils/cacheTags';
import { getProfileContext } from 'utils/profile';

import { SubmissionsSkeleton } from '../_components/skeletons';
import Submissions from './submissions';

async function fetchSubmissions(
  profileContext: ProfileContext,
  page: number,
  query: string,
  formIds: string[]
) {
  const { accessToken, selectedTeam } = profileContext;
  const params = buildSubmissionApiSearchParams({ page, query, formIds });
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/submissions?${params.toString()}`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const payload = await res.json();
  if (!res.ok) {
    const errorType = submissionApiErrorType(payload);
    if (res.status === 400 && errorType === INVALID_FORM_FILTER)
      return { errorType } as const;
    throw new Error(`Unable to load submissions (HTTP ${res.status})`);
  }
  const limit = numericPaginationHeader(res.headers.get('per-page'));
  const total = numericPaginationHeader(res.headers.get('total'));
  const offset = (page - 1) * (limit + 1);
  const { data } = payload;
  return { data, pagination: { limit, total, offset } };
}

async function fetchTeamForms(): Promise<FormFilterMetadata[]> {
  'use cache: private';
  cacheLife({ stale: 60 * 5 });
  const { accessToken, selectedTeam } = await getProfileContext();
  cacheTag(formsCacheTag(selectedTeam.id));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/forms`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!res.ok)
    throw new Error(`Unable to load team forms (HTTP ${res.status})`);
  const { data } = await res.json();
  return data;
}

export default function SubmissionsPage({
  searchParams,
}: {
  searchParams?: Promise<SubmissionsSearchParams>;
}) {
  return (
    <>
      <header className="mb-[25px] flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px] [&_h1]:mb-[7px] [&_h1]:ml-0 [&_h1]:mr-0 [&_h1]:mt-0 [&_h1]:text-[clamp(27px,_2.3vw,_34px)] [&_h1]:font-bold [&_h1]:leading-[1.15] [&_h1]:tracking-[-0.035em] [&_h1]:text-[#202126]">
        <div className="min-w-0">
          <p className="mb-1.5 ml-0 mr-0 mt-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#a33a34]">
            Incoming messages
          </p>
          <h1>Submissions</h1>
          <p className="m-0 max-w-[660px] text-sm leading-[1.45] text-muted">
            Review, search, filter, and classify submissions without leaving the
            main workspace.
          </p>
        </div>
      </header>
      <Suspense fallback={<SubmissionsSkeleton />}>
        <SubmissionsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SubmissionsContent({
  searchParams,
}: {
  searchParams?: Promise<SubmissionsSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const selectedForms = parseSubmissionFormIds(resolvedSearchParams);
  const profileContext = await getProfileContext();
  const formsPromise = fetchTeamForms().catch(() => {
    console.error('Unable to load submission filter form metadata.');
    return undefined;
  });
  const [result, forms] = await Promise.all([
    fetchSubmissions(profileContext, currentPage, query, selectedForms),
    formsPromise,
  ]);
  if ('errorType' in result) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <p>The form filter in this URL is invalid.</p>
        <Link
          className="mt-2 inline-block font-medium underline"
          href={submissionFilterRecoveryHref(query)}
        >
          View all submissions
        </Link>
      </div>
    );
  }
  return (
    <Submissions
      repliesEnabled={process.env.FORMDELEGATE_ENABLE_INBOX_REPLIES === 'true'}
      submissions={result.data}
      pagination={result.pagination}
      formFilterSummary={formFilterSummary(selectedForms, forms)}
      forms={forms}
    />
  );
}

export const metadata: Metadata = {
  title: 'Submissions - Form Delegate',
  description: 'View and manage your form submissions.',
};
