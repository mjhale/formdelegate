import type { Metadata } from 'next';

import Link from 'next/link';
import { SpeedInsights } from '@vercel/speed-insights/next';

import NavBar from './_components/navbar';

import '../globals.css';

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
    <html lang="en">
      <body className="antialiased text-slate-900 bg-amber-50">
        <div className="w-full">
          <div className="lg:flex">
            <NavBar links={navigationLinks} />
            <div className="mt-16 mx-4 lg:mt-4 lg:w-full">
              <section className="">{children}</section>
              <div className="flex justify-center pt-8 pb-4 my-4 space-x-4">
                <a
                  href="https://github.com/mjhale/formdelegate"
                  className="text-xs underline text-gray-500"
                  target="_blank"
                  rel="noopener"
                >
                  GitHub
                </a>
                <Link
                  href="/privacy"
                  className="text-xs underline text-gray-500"
                  prefetch={false}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/tos"
                  className="text-xs underline text-gray-500"
                  prefetch={false}
                >
                  Terms of Service
                </Link>
                <Link
                  href="/contact"
                  className="text-xs underline text-gray-500"
                  prefetch={false}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: 'Manage Custom HTML Forms With No Code - Form Delegate',
  description:
    'Form Delegate is a simple and secure form management solution for surveys, registrations, feedback, and more. No server code required.',
};
