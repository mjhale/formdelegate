import type { Metadata } from 'next';

import { cookies } from 'next/headers';

import Submissions from './submissions';

async function fetchSubmissions(page: number, query: string) {
  const accessToken = cookies().get('access_token')?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/submissions?page=${page}${
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
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const { data: submissions, pagination } = await fetchSubmissions(
    currentPage,
    query
  );

  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        Submissions
      </h1>

      <Submissions submissions={submissions} pagination={pagination} />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Submissions - Form Delegate',
  description: 'View and manage your form submissions.',
};
