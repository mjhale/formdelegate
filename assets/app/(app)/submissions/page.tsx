import type { Metadata } from 'next';

import Link from 'next/link';
import { Suspense } from 'react';

import { getProfileContext } from 'utils/profile';

import { SubmissionsSkeleton } from '../_components/skeletons';

import Submissions from './submissions';
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
  page: number,
  query: string,
  formIds: string[]
) {
  const { accessToken, selectedTeam } = await getProfileContext();
  const params = buildSubmissionApiSearchParams({
    page,
    query,
    formIds,
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/submissions?${params.toString()}`,
    {
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

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams?: Promise<SubmissionsSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const selectedForms = parseSubmissionFormIds(resolvedSearchParams);

  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        Submissions
      </h1>

      <Suspense
        fallback={<SubmissionsSkeleton />}
        key={`${currentPage}:${query}:${selectedForms.join(',')}`}
      >
        <SubmissionsContent
          currentPage={currentPage}
          query={query}
          selectedForms={selectedForms}
        />
      </Suspense>
    </>
  );
}

async function SubmissionsContent({
  currentPage,
  query,
  selectedForms,
}: {
  currentPage: number;
  query: string;
  selectedForms: string[];
}) {
  const result = await fetchSubmissions(
    currentPage,
    query,
    selectedForms
  );

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
    <Submissions submissions={result.data} pagination={result.pagination} />
  );
}

export const metadata: Metadata = {
  title: 'Submissions - Form Delegate',
  description: 'View and manage your form submissions.',
};
