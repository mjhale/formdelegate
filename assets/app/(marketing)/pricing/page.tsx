import type { Metadata } from 'next';

import Link from 'next/link';

export default async function PricingPage() {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl">
          <h1 className="text-3xl lowercase tracking-wide font-semibold">
            Pricing Information
          </h1>
          <p>
            Sign up for free, and then choose a plan that best meets your needs.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col p-4 bg-white border border-gray-300 rounded shadow-lg">
              <div className="flex flex-col items-center">
                <div className="font-semibold mb-2">Basic</div>
                <div className="font-extrabold text-3xl mb-4">Free</div>
              </div>
              <hr className="mb-4" />
              <div className="flex flex-col items-start gap-2 text-sm">
                <div>Good for personal websites</div>
                <div>100 Submissions</div>
                <div>1GB Storage</div>
                <div>Unlimited forms</div>
              </div>
            </div>

            <div className="flex flex-col p-4 bg-white border border-gray-300 rounded shadow-lg">
              <div className="flex flex-col items-center">
                <div className="font-semibold mb-2">Professional</div>
                <div className="font-extrabold text-3xl mb-4">$25/mo</div>
              </div>
              <hr className="mb-4" />
              <div className="flex flex-col items-start gap-2 text-sm">
                <div>Good for businesses</div>
                <div>5K Submissions</div>
                <div>20GB Storage</div>
                <div>Unlimited forms</div>
              </div>
            </div>

            <div className="flex flex-col p-4 bg-white border border-gray-300 rounded shadow-lg">
              <div className="flex flex-col items-center">
                <div className="font-semibold mb-2">Enterprise</div>
                <div className="font-extrabold text-3xl mb-4">$300/mo</div>
              </div>
              <hr className="mb-4" />
              <div className="flex flex-col items-start gap-2 text-sm">
                <div>Good for large organizations</div>
                <div>100K Submissions</div>
                <div>1TB Storage</div>
                <div>Unlimited forms</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href="/signup"
              className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Pricing and Free Tier Information - Form Delegate',
  description:
    'Discover our pricing options for managing HTML forms with no server-side code. Get started with our free tier today.',
};
