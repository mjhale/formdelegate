import type { Metadata } from 'next';
import type Form from 'types/form';

import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Inbox,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { Suspense } from 'react';

import { formCacheTag, formsCacheTag } from 'utils/cacheTags';
import { getProfileContext } from 'utils/profile';
import { publicFormEndpoint } from 'utils/publicFormEndpoint';

import { ButtonLink } from '../../_components/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../_components/card';
import { FormDetailsSkeleton } from '../../_components/skeletons';
import CopyToClipboardButton from '../copyToClipboardButton';

export default function ShowFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  return (
    <>
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

  const restricted = form.submission_source_policy === 'restricted';
  const hosts = form.hosts ?? [];
  const editHref = `/forms/${form.id}/edit`;
  const submissionsHref = `/submissions?form[]=${form.id}`;

  return (
    <>
      <header className="mb-[25px] flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px] [&_h1]:mb-[7px] [&_h1]:ml-0 [&_h1]:mr-0 [&_h1]:mt-0 [&_h1]:text-[clamp(27px,_2.3vw,_34px)] [&_h1]:font-bold [&_h1]:leading-[1.15] [&_h1]:tracking-[-0.035em] [&_h1]:text-[#202126]">
        <div className="min-w-0">
          <Link
            href="/forms"
            className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-brand-deep hover:underline"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to forms
          </Link>
          <p className="mb-1.5 ml-0 mr-0 mt-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#a33a34]">
            Form overview
          </p>
          <h1 className="break-words">{form.name}</h1>
          <p className="m-0 max-w-[660px] text-sm leading-[1.45] text-muted">
            Your endpoint, verification status, and submission access at a
            glance.
          </p>
        </div>
        <div className="flex flex-[0_0_auto] flex-wrap gap-[9px] max-lg:w-full max-lg:[&>a]:flex-1 max-lg:[&>button]:flex-1">
          <ButtonLink href={submissionsHref}>
            <Inbox aria-hidden="true" /> View submissions
          </ButtonLink>
          <ButtonLink variant={'primary'} href={editHref}>
            <Pencil aria-hidden="true" /> Edit form
          </ButtonLink>
        </div>
      </header>

      <div className="max-w-6xl space-y-5">
        <Card aria-labelledby="endpoint-heading">
          <CardHeader>
            <div>
              <CardTitle id="endpoint-heading">Form endpoint</CardTitle>
              <CardDescription>
                Use this URL as the action of your website’s form.
              </CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border border-[#e7e1d6] bg-[#f8f4ec] p-3">
              <span className="rounded border border-line-strong bg-white px-2 py-1 font-mono text-[10px] font-semibold text-brand-deep">
                POST
              </span>
              <code className="min-w-0 flex-1 break-all text-xs leading-6 text-[#544b48]">
                {publicFormEndpoint(form.id)}
              </code>
              <CopyToClipboardButton form={{ id: form.id, name: form.name }} />
            </div>
            <dl className="grid gap-4 border-t border-[#e7e1d6] pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted">Submissions received</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {form.submission_count.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Created</dt>
                <dd className="mt-2 text-sm">{formatDate(form.inserted_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Last updated</dt>
                <dd className="mt-2 text-sm">{formatDate(form.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </Card>

        <div className="grid items-start gap-5 lg:grid-cols-2">
          <Card aria-labelledby="verification-heading">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={18}
                  className="text-brand-deep"
                  aria-hidden="true"
                />
                <CardTitle id="verification-heading">Verification</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-4 p-5 sm:p-6">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${form.verified ? 'border-[#c9e5d9] bg-[#edf8f1] text-[#2f7051]' : 'border-[#ecd8a4] bg-[#fff8e8] text-[#89631e]'}`}
              >
                {form.verified ? 'Verified' : 'Pending verification'}
              </span>
              <p className="text-sm leading-6 text-muted">
                {form.verified
                  ? 'This form has completed endpoint verification.'
                  : 'This form has not completed endpoint verification. Review its configuration for the current setup.'}
              </p>
              <Link
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-deep hover:underline"
                href={editHref}
              >
                Review configuration <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </Card>

          <Card aria-labelledby="source-heading">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe
                  size={18}
                  className="text-brand-deep"
                  aria-hidden="true"
                />
                <CardTitle id="source-heading">Website access</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-4 p-5 sm:p-6">
              <p className="text-sm font-semibold">
                {restricted ? 'Only allowed websites' : 'Any website'}
              </p>
              <p className="text-sm leading-6 text-muted">
                {restricted
                  ? 'Submissions must include browser source information matching an allowed host.'
                  : 'This endpoint is not restricted to specific browser hostnames.'}
              </p>
              {hosts.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-medium text-muted">
                    {restricted ? 'Allowed hosts' : 'Saved hosts · inactive'}
                  </h3>
                  <ul className="space-y-2">
                    {hosts.map((host) => (
                      <li
                        key={host}
                        className="break-all rounded-md border border-[#e7e1d6] bg-[#faf7f1] px-3 py-2 font-mono text-xs"
                      >
                        {host}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs leading-5 text-muted">
                    {restricted
                      ? 'Wildcard rules match subdomains, not the apex domain.'
                      : 'Saved host rules only apply when website restrictions are enabled.'}
                  </p>
                </div>
              )}
              {restricted && hosts.length === 0 && (
                <p className="rounded-lg border border-[#ecd8a4] bg-[#fff8e8] p-3 text-sm text-[#89631e]">
                  No allowed hosts are configured. Add a website in form
                  settings.
                </p>
              )}
              <Link
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-deep hover:underline"
                href={editHref}
              >
                Manage website access{' '}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
}

async function fetchForm(formId: string): Promise<Form> {
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
