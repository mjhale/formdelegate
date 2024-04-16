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
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
