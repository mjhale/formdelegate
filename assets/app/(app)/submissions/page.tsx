import type { Metadata } from 'next';

import { Suspense } from 'react';

import { getProfileContext } from 'utils/profile';

import { SubmissionsSkeleton } from '../_components/skeletons';

import Submissions from './submissions';
import {
  buildSubmissionApiSearchParams,
  parseSubmissionFormIds,
  SubmissionsSearchParams,
} from './filterParams';

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

  const limit = Number(res.headers.get('per-page'));
  const total = Number(res.headers.get('total'));
  const offset = (page - 1) * (limit + 1);

  const { data } = await res.json();

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
  const { data: submissions, pagination } = await fetchSubmissions(
    currentPage,
    query,
    selectedForms
  );

  return <Submissions submissions={submissions} pagination={pagination} />;
}

export const metadata: Metadata = {
  title: 'Submissions - Form Delegate',
  description: 'View and manage your form submissions.',
};
