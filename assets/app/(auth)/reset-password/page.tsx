import { Lato } from 'next/font/google';
import Link from 'next/link';

import ResetRequest from './resetRequest';
import ResetPassword from './resetPassword';

const lato = Lato({
  weight: ['700', '900'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
});

export default async function ResetPasswordPage({ searchParams }) {
  const { token } = searchParams;

  return (
    <>
      <div className="flex justify-center align-middle items-center h-32 mb-4">
        <Link
          href="/"
          className={`block md:max-w-[4em] text-center text-2xl italic font-black no-underline text-neutral-100 ${lato.className} font-sans md:leading-8 md:text-5xl lowercase hover:text-white active:animate-scale-increase-fast`}
        >
          Form Delegate
        </Link>
      </div>
      <div className="bg-white border rounded-lg p-6 text-black mb-4">
        {token ? <ResetPassword token={token} /> : <ResetRequest />}
      </div>
      <div className="flex justify-center text-sm text-gray-800 font-medium">
        Don't have an account?
        <Link href="/signup" className="pl-1">
          Sign up
        </Link>
      </div>
    </>
  );
}
