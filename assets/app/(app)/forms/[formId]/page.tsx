import type { Metadata } from 'next';

import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';

import { formCacheTag, formsCacheTag } from 'utils/cacheTags';
import { getProfileContext } from 'utils/profile';

import Link from 'next/link';
import { FormDetailsSkeleton } from '../../_components/skeletons';

export default function ShowFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        Form
      </h1>
      <Suspense fallback={<FormDetailsSkeleton />}>
        <FormDetails params={params} />
      </Suspense>
    </>
  );
}

async function FormDetails({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = await fetchForm(formId);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center h-10 max-w-xl">
        <label className="flex-0 w-1/4">Form Name</label>
        <div className="flex-1 shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight">
          {form.name}
        </div>
      </div>
      <div className="flex items-center max-w-xl">
        <label className="flex-0 w-1/4">Endpoint URL</label>
        <div className="flex-1 shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight">
          {`https://formdelegate.com/f/${form.id}`}
        </div>
      </div>
      <div className="flex items-center h-10 max-w-xl">
        <label className="flex-0 w-1/4">Status</label>
        <div className="flex-1 shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight">
          {form.verified ? 'Verified' : 'Pending Verification'}
        </div>
      </div>
      <div className="flex items-center h-10 max-w-xl">
        <label className="flex-0 w-1/4">Submission Count</label>
        <div className="flex-1 shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight">
          {form.submission_count}
        </div>
      </div>
      <div className="flex max-w-xl items-start">
        <div className="w-1/4 pt-2">Submission Sources</div>
        <div className="flex-1 rounded border px-3 py-2 text-gray-700 shadow-sm">
          {form.submission_source_policy === 'restricted' ? (
            <>
              <p className="font-medium">Only allowed websites</p>
              <ul className="mt-2 list-disc pl-5">
                {(form.hosts ?? []).map((host) => (
                  <li key={host}>
                    <code>{host}</code>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            'Any website'
          )}
        </div>
      </div>
      <div>
        <Link
          href={`/forms/${form.id}/edit`}
          className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
        >
          Edit Form
        </Link>
      </div>
    </div>
  );
}

async function fetchForm(formId: string) {
  'use cache: private';
  cacheLife({ stale: 60 * 5 });

  const { accessToken, selectedTeam } = await getProfileContext();
  cacheTag(
    formsCacheTag(selectedTeam.id),
    formCacheTag(selectedTeam.id, formId)
  );

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${selectedTeam.id}/forms/${formId}`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Unable to fetch form.');
  }

  const { data } = await res.json();

  return data;
}

export const metadata: Metadata = {
  title: 'Form Details - Form Delegate',
  description: 'View details and stats on your form.',
};
