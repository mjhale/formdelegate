import type { Metadata } from 'next';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Submission received - Form Delegate',
  robots: { index: false, follow: false },
};

export default function SubmissionSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xs">
        <CheckCircle2
          aria-hidden="true"
          className="mx-auto h-12 w-12 text-emerald-700"
        />
        <h1 className="mt-5 text-3xl font-semibold">Submission received</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Your form has been submitted successfully. You can close this page or
          return to the website you came from.
        </p>
        <Link
          href="/"
          prefetch={false}
          className="mt-8 inline-block text-sm font-semibold text-carnation-500 underline underline-offset-4 hover:text-carnation-700"
        >
          Form Delegate
        </Link>
      </section>
    </main>
  );
}
