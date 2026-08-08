import type { Metadata } from 'next';

import Link from 'next/link';
import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';

import { formsCacheTag } from 'utils/cacheTags';
import { getProfileContext } from 'utils/profile';
import type { ProfileContext } from 'utils/profile';

import { SubmissionsSkeleton } from '../_components/skeletons';

import Submissions from './submissions';
import { formFilterSummary, FormFilterMetadata } from './formFilterSummary';
import {
  buildSubmissionApiSearchParams,
  parseSubmissionFormIds,
  SubmissionsSearchParams,
} from './filterParams';
import {
  INVALID_FORM_FILTER,
  numericPaginationHeader,
  submissionApiErrorType,
  submissionFilterRecoveryHref,
} from './submissionResponse';

async function fetchSubmissions(
  profileContext: ProfileContext,
  page: number,
  query: string,
  formIds: string[]
) {
  const { accessToken, selectedTeam } = profileContext;
  const params = buildSubmissionApiSearchParams({
    page,
    query,
    formIds,
  });

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

    if (res.status === 400 && errorType === INVALID_FORM_FILTER) {
      return { errorType } as const;
    }

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

  if (!res.ok) {
    throw new Error(`Unable to load team forms (HTTP ${res.status})`);
  }

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
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        Submissions
      </h1>

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
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
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
