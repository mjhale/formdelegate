import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import Link from 'next/link';

import { deleteForm } from './actions';

import CopyToClipboardButton from './copyToClipboardButton';

async function fetchForms() {
  const accessToken = cookies().get('access_token')?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/forms`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { data } = await res.json();

  return data;
}

export default async function FormsPage() {
  const forms = await fetchForms();

  return (
    <>
      <h1 className="text-2xl lowercase pb-4 tracking-wide font-semibold">
        Forms
      </h1>
      <div className="mb-4">
        <Link
          href="/forms/new"
          className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
        >
          Add Form
        </Link>
      </div>
      <div className="flex flex-col gap-y-4">
        {forms.map((form) => {
          const deleteFormWithId = deleteForm.bind(null, form.id);

          return (
            <div
              key={form.id}
              className="border border-grey-600 rounded-t overflow-hidden"
            >
              <div className="bg-carnation-400 text-white rounded-t border-stone-200 block text-sm font-semibold leading-6 p-2 uppercase">
                {form.name}
              </div>
              <div className="bg-white">
                <div className="flex flex-wrap gap-2 md:gap-4 justify-center content-between items-center p-2 text-center break-all">
                  <div className="md:flex-auto bg-slate-200 py-2">
                    <span className="text-sm">{`https://www.formdelegate.com/f/${form.id}`}</span>
                  </div>
                  <div className="">
                    <CopyToClipboardButton form={form} />
                  </div>
                </div>
                <div className="flex gap-x-2 justify-between pb-2 px-2 md:gap-x-0">
                  <div className="flex gap-x-2">
                    <Link
                      href={`/forms/${form.id}/edit`}
                      className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer text-center md:text-start"
                    >
                      Edit Form
                    </Link>
                    <Link
                      href={`/submissions?form[]=${form.id}`}
                      className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer text-center md:text-start"
                    >
                      View Submissions
                    </Link>
                  </div>
                  <div className="">
                    <form action={deleteFormWithId}>
                      <button className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer text-center md:text-start">
                        Delete Form
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Forms - Form Delegate',
  description: 'View your Form Delegate forms.',
};
