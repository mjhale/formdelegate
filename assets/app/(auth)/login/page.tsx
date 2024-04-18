import type { Metadata } from 'next';

import { Suspense } from 'react';
import { Lato } from 'next/font/google';
import Link from 'next/link';

import LoginForm from './form';

const lato = Lato({
  weight: ['700', '900'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
});

export default async function LoginPage() {
  return (
    <>
      <div className="flex justify-center align-middle items-center h-32 mb-4">
        <Link
          href="/"
          className={`block max-w-40 text-center text-4xl leading-7 italic font-black no-underline text-neutral-100 ${lato.className} font-sans md:max-w-[4em] md:leading-8 md:text-5xl lowercase hover:text-white active:animate-scale-increase-fast`}
        >
          Form Delegate
        </Link>
      </div>
      <div className="bg-white border rounded-md p-6 text-black mx-4 md:mx-0 md:rounded-lg">
        <h1 className="text-2xl font-light text-center mb-4">Sign In</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
        <div className="flex justify-end max-w-xs mx-auto pt-4">
          <Link href="/reset-password" className="font-semibold text-sm">
            Need help?
          </Link>
        </div>
      </div>
      <div className="flex justify-center text-sm text-gray-800 font-medium mt-4">
        Don't have an account?
        <Link href="/signup" className="pl-1">
          Sign up
        </Link>
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Log In - Form Delegate',
  description: 'Log in to the Form Delegate service and manage your forms.',
};
