import type { Metadata } from 'next';
import type Form from 'types/form';

import { Pencil, Plus } from 'lucide-react';
import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { Suspense } from 'react';

import { formsCacheTag } from 'utils/cacheTags';
import { getProfileContext } from 'utils/profile';
import { publicFormEndpoint } from 'utils/publicFormEndpoint';

import { ButtonLink } from '../_components/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../_components/card';
import EmptyState from '../_components/emptyState';
import { FormsSkeleton } from '../_components/skeletons';
import CopyToClipboardButton from './copyToClipboardButton';

async function fetchForms(): Promise<Form[]> {
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

  if (!res.ok) throw new Error('Unable to fetch forms.');

  const { data } = await res.json();
  return data;
}

export default async function FormsPage() {
  return (
    <>
      <header className="mb-[25px] flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px] [&_h1]:mb-[7px] [&_h1]:ml-0 [&_h1]:mr-0 [&_h1]:mt-0 [&_h1]:text-[clamp(27px,_2.3vw,_34px)] [&_h1]:font-bold [&_h1]:leading-[1.15] [&_h1]:tracking-[-0.035em] [&_h1]:text-[#202126]">
        <div className="min-w-0">
          <p className="mb-1.5 ml-0 mr-0 mt-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#a33a34]">
            Endpoint management
          </p>
          <h1>Forms</h1>
          <p className="m-0 max-w-[660px] text-sm leading-[1.45] text-muted">
            Create and manage the endpoints that receive submissions from your
            websites.
          </p>
        </div>
        <div className="flex flex-[0_0_auto] gap-[9px] max-lg:w-full max-lg:[&>a]:flex-1 max-lg:[&>button]:flex-1">
          <ButtonLink variant={'primary'} href="/forms/new">
            <Plus aria-hidden="true" />
            Add form
          </ButtonLink>
        </div>
      </header>

      <Suspense fallback={<FormsSkeleton />}>
        <FormsList />
      </Suspense>
    </>
  );
}

async function FormsList() {
  const forms = await fetchForms();
  const restrictedForms = forms.filter(
    (form) => form.submission_source_policy === 'restricted'
  ).length;
  const verifiedForms = forms.filter((form) => form.verified).length;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Form endpoints</CardTitle>
            <CardDescription>
              {forms.length.toLocaleString()} active{' '}
              {forms.length === 1 ? 'form is' : 'forms are'} available in this
              workspace.
            </CardDescription>
          </div>
        </CardHeader>

        {forms.length > 0 ? (
          forms.map((form) => {
            return (
              <div
                className="grid min-w-0 items-center gap-4 border-t border-[#e7e1d6] px-5 py-5 xl:grid-cols-[minmax(160px,0.8fr)_minmax(0,1.4fr)_240px] xl:gap-6"
                key={form.id}
              >
                <div className="min-w-0 [&>span]:mt-1 [&>span]:block [&>span]:text-[10px] [&>span]:text-muted [&>strong]:block [&>strong]:break-words [&>strong]:text-[13px]">
                  <strong>
                    <Link
                      href={`/forms/${form.id}`}
                      className="hover:text-brand-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#bf453d]"
                    >
                      {form.name}
                    </Link>
                  </strong>
                  <span>Created {formatDate(form.inserted_at)}</span>
                  <span className="tabular-nums">
                    {form.submission_count.toLocaleString()} submissions
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-3 rounded-lg border border-[#e7e1d6] bg-[#faf7f1] p-2.5">
                  <code
                    className="min-w-0 flex-1 truncate text-[11px] text-[#544b48]"
                    title={publicFormEndpoint(form.id)}
                  >
                    {publicFormEndpoint(form.id)}
                  </code>
                  <div className="shrink-0">
                    <CopyToClipboardButton
                      form={{ id: form.id, name: form.name }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                  <ButtonLink size="small" href={`/forms/${form.id}/edit`}>
                    <Pencil aria-hidden="true" />
                    Edit
                  </ButtonLink>
                  <ButtonLink
                    size="small"
                    href={`/submissions?form[]=${form.id}`}
                  >
                    View submissions
                  </ButtonLink>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="Create your first form"
            description="Add an endpoint and connect it to your website to start receiving submissions."
            href="/forms/new"
            action="Add form"
          />
        )}
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Protection overview</CardTitle>
            <CardDescription>
              A workspace-level view of endpoint verification and browser source
              policies.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
          <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
            <strong>Verified endpoints</strong>
            <p>Forms that have completed endpoint verification.</p>
          </div>
          <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
            {verifiedForms} of {forms.length} verified
          </div>
          <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold ${verifiedForms < forms.length ? 'border-[#ecd8a4] bg-[#fff8e8] text-[#89631e]' : 'border-[#c9e5d9] bg-[#edf8f1] text-[#2f7051]'}`}
            >
              <span className="h-[5px] w-[5px] rounded-full bg-[currentColor]" />
              {forms.length === 0
                ? 'No forms'
                : verifiedForms === forms.length
                  ? 'Ready'
                  : 'Review'}
            </span>
          </div>
        </div>
        <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
          <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
            <strong>Restricted source policies</strong>
            <p>Forms limited to approved browser hostnames.</p>
          </div>
          <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
            {restrictedForms} of {forms.length} restricted
          </div>
          <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1">
            <ButtonLink size="small" href="/forms">
              Review forms
            </ButtonLink>
          </div>
        </div>
      </Card>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export const metadata: Metadata = {
  title: 'Forms - Form Delegate',
  description: 'View your Form Delegate forms.',
};
