import type { Metadata } from 'next';

import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';

import { formCacheTag, formsCacheTag } from 'utils/cacheTags';
import { getProfileContext } from 'utils/profile';
import { reverifyEmailIntegration, updateForm } from '../../actions';

import { FormDetailsSkeleton } from '../../../_components/skeletons';
import Form from '../../form';

export default function EditFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  return (
    <>
      <h1 className="text-3xl lowercase pb-4 tracking-wide font-semibold">
        Edit Form
      </h1>
      <Suspense fallback={<FormDetailsSkeleton />}>
        <EditForm params={params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const form = await fetchForm(formId);

  return (
    <Form
      form={form}
      saveFormAction={updateForm}
      reverifyEmailIntegrationAction={reverifyEmailIntegration}
    />
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
  title: 'Edit Form Details - Form Delegate',
  description: 'Manage your form as well as any integrations.',
};
