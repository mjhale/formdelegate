import type { Metadata } from 'next';

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
            <div className="my-16 mx-4 lg:my-4 lg:w-full">
              <section className="">{children}</section>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: 'Manage Custom HTML Forms With No Code - Form Delegate',
  description:
    'Form Delegate is a simple and secure form management solution for surveys, registrations, feedback, and more. No server code required.',
};
