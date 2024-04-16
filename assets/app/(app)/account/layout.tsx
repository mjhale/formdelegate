import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex gap-x-2 mb-4">
        <Link
          href="/account"
          className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
        >
          Account
        </Link>
        <Link
          href="/account/billing"
          className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
        >
          Billing
        </Link>
      </div>
      {children}
    </>
  );
}
