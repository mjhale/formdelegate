import type { Metadata } from 'next';

import Link from 'next/link';

export default async function PricingPage() {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex w-full max-w-4xl flex-col gap-y-4">
          <h1 className="text-3xl font-semibold lowercase tracking-wide">
            Pricing Information
          </h1>

          <p>
            Sign up for free, and then choose a plan that best meets your needs.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col rounded border border-gray-300 bg-white p-4 shadow-lg">
              <div className="flex flex-col items-center">
                <div className="mb-2 font-semibold">Basic</div>
                <div className="mb-4 text-3xl font-extrabold">Free</div>
              </div>
              <hr className="mb-4" />
              <div className="flex flex-col items-start gap-2 text-sm">
                <div>Good for personal websites</div>
                <div>100 Submissions</div>
                <div>1GB Storage</div>
                <div>Unlimited forms</div>
              </div>
            </div>

            <div className="flex flex-col rounded border border-gray-300 bg-white p-4 shadow-lg">
              <div className="flex flex-col items-center">
                <div className="mb-2 font-semibold">Professional</div>
                <div className="mb-4 text-3xl font-extrabold">$25/mo</div>
              </div>
              <hr className="mb-4" />
              <div className="flex flex-col items-start gap-2 text-sm">
                <div>Good for businesses</div>
                <div>5K Submissions</div>
                <div>20GB Storage</div>
                <div>Unlimited forms</div>
              </div>
            </div>

            <div className="flex flex-col rounded border border-gray-300 bg-white p-4 shadow-lg">
              <div className="flex flex-col items-center">
                <div className="mb-2 font-semibold">Enterprise</div>
                <div className="mb-4 text-3xl font-extrabold">$300/mo</div>
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

          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="whitespace-no-wrap inline-block rounded-md border border-gray-200 bg-white px-3 py-1 text-base font-medium leading-6 text-gray-600 shadow-sm hover:cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
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
