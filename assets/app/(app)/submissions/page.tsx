import type { Metadata } from 'next';

import { Suspense } from 'react';

import { getProfileContext } from 'utils/profile';

import { SubmissionsSkeleton } from '../_components/skeletons';

import Submissions from './submissions';

async function fetchSubmissions(page: number, query: string) {
  const { accessToken, selectedTeam } = await getProfileContext();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/submissions?page=${page}${
      query && `&query=${query}`
    }`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const limit = Number(res.headers.get('per-page'));
  const total = Number(res.headers.get('total'));
  const offset = (page - 1) * (limit + 1);

  const { data } = await res.json();

  return { data, pagination: { limit, total, offset } };
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        Submissions
      </h1>

      <Suspense
        fallback={<SubmissionsSkeleton />}
        key={`${currentPage}:${query}`}
      >
        <SubmissionsContent currentPage={currentPage} query={query} />
      </Suspense>
    </>
  );
}

async function SubmissionsContent({
  currentPage,
  query,
}: {
  currentPage: number;
  query: string;
}) {
  const { data: submissions, pagination } = await fetchSubmissions(
    currentPage,
    query
  );

  return <Submissions submissions={submissions} pagination={pagination} />;
}

export const metadata: Metadata = {
  title: 'Submissions - Form Delegate',
  description: 'View and manage your form submissions.',
};
