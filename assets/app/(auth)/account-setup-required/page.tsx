import type { Metadata } from 'next';

import Link from 'next/link';

export default function AccountSetupRequiredPage() {
  return (
    <div className="bg-white border rounded-md p-6 text-black mx-4 md:mx-0 md:rounded-lg">
      <h1 className="text-2xl font-light text-center mb-4">
        Account setup required
      </h1>
      <p className="text-sm leading-6 text-gray-700">
        Your account is signed in, but it is not attached to a team yet. Contact
        support so we can finish setting up your workspace.
      </p>
      <div className="mt-6 flex justify-end">
        <Link href="/contact" className="font-semibold text-sm underline">
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
