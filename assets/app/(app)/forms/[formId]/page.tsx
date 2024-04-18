import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function ShowFormPage({
  params,
}: {
  params: { formId: string };
}) {
  async function fetchForm() {
    const accessToken = cookies().get('access_token')?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/v1/forms/${params.formId}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { data } = await res.json();

    return data;
  }

  const form = await fetchForm();

  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        Form
      </h1>

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
        <div>
          <Link
            href={`/forms/${form.id}/edit`}
            className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
          >
            Edit Form
          </Link>
        </div>
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Form Details - Form Delegate',
  description: 'View details and stats on your form.',
};
