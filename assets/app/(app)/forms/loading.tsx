import Link from 'next/link';

import { FormsSkeleton } from '../_components/skeletons';

export default function Loading() {
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
      <FormsSkeleton />
    </>
  );
}
