import type { Metadata } from 'next';

import Link from 'next/link';

import '../globals.css';

import NavBar from './_components/navbar';

const navigationLinks = [
  {
    name: 'Dashboard',
    href: '/dashboard',
  },
  {
    name: 'Submissions',
    href: '/submissions',
  },
  {
    name: 'Forms',
    href: '/forms',
  },
  {
    name: 'Account',
    href: '/account',
  },
  {
    name: 'Support',
    href: '/support',
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="lg:h-full">
      <body className="antialiased text-slate-900 bg-amber-50 lg:h-full">
        <div className="w-full max-w-screen-xl mx-auto px-6 lg:h-full">
          <div className="lg:flex -mx-6 lg:h-full">
            <NavBar links={navigationLinks} />
            <div className="my-16 mx-4 lg:my-4 lg:w-full">
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
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: 'Form Delegate',
  description:
    'Form Delegate is a simple and secure form management solution for surveys, registrations, feedback, and more. No server code required.',
};
