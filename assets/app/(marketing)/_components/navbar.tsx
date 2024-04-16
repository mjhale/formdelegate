import { Lato } from 'next/font/google';

import Link from 'next/link';

import MobileMenu from './mobileMenu';

const lato = Lato({
  weight: ['700', '900'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
});

export default function Navbar({ links }) {
  return (
    <section className="fixed inset-0 flex flex-wrap items-center justify-between h-12 z-10 w-full bg-nav-pattern bg-center bg-no-repeat bg-cover bg-red-900 px-4 lg:z-0 lg:static lg:content-start lg:min-h-screen lg:h-auto lg:p-0 lg:w-1/4 xl:w-1/5">
      <div className="lg:text-center lg:p-6 lg:m-auto">
        <Link
          href="/"
          className={`inline-block text-2xl italic font-black no-underline text-neutral-200 ${lato.className} font-sans lowercase hover:text-white active:animate-scale-increase-fast lg:leading-8 lg:text-4xl lg:max-w-[4em]`}
        >
          Form Delegate
        </Link>
      </div>
      <MobileMenu links={links} />
      <nav className="hidden lg:block lg:w-full lg:bg-transparent lg:border-t-0 lg:shadow-none">
        <ul>
          {links.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="block text-slate-300 lowercase tracking-wide p-4 font-sans hover:text-white hover:bg-red-900 hover:border-r-8 border-red-300"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
