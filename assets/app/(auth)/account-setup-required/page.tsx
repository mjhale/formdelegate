import type { Metadata } from 'next';

import Link from 'next/link';

export default function AccountSetupRequiredPage() {
  return (
    <div className="mx-4 rounded-md border bg-white p-6 text-black md:mx-0 md:rounded-lg">
      <h1 className="mb-4 text-center text-2xl font-light">
        Account setup required
      </h1>
      <p className="text-sm leading-6 text-gray-700">
        Your account is signed in, but it is not attached to a team yet. Contact
        support so we can finish setting up your workspace.
      </p>
      <div className="mt-6 flex justify-end">
        <Link href="/contact" className="text-sm font-semibold underline">
          Contact support
        </Link>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Account Setup Required - Form Delegate',
  description: 'This account needs a team before it can use Form Delegate.',
};
