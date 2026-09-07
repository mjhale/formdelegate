import type { Metadata } from 'next';

import Link from 'next/link';

import NavBar from './_components/navbar';

const navigationLinks = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'FAQ',
    href: '/faq',
  },
  {
    name: 'Pricing',
    href: '/pricing',
  },
  {
    name: 'Sign In',
    href: '/login',
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-amber-50 text-slate-900">
      <div className="lg:flex">
        <NavBar links={navigationLinks} />
        <div className="mx-4 mt-16 lg:mt-4 lg:w-full">
          <section>{children}</section>
          <div className="my-4 flex justify-center space-x-4 pb-4 pt-8">
            <a
              href="https://github.com/mjhale/formdelegate"
              className="text-xs text-gray-500 underline"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
            <Link
              href="/privacy"
              className="text-xs text-gray-500 underline"
              prefetch={false}
            >
              Privacy Policy
            </Link>
            <Link
              href="/tos"
              className="text-xs text-gray-500 underline"
              prefetch={false}
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-xs text-gray-500 underline"
              prefetch={false}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Manage Custom HTML Forms With No Code - Form Delegate',
  description:
    'Form Delegate is a simple and secure form management solution for surveys, registrations, feedback, and more. No server code required.',
};
