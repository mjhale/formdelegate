import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import MobileMenu from './mobileMenu';
import NavLink from './navLink';

export default function Navbar({ links }) {
  return (
    <section className="fixed inset-0 z-10 flex h-12 w-full flex-wrap items-center justify-between bg-red-900 bg-nav-pattern bg-cover bg-center bg-no-repeat px-4 lg:static lg:z-0 lg:h-auto lg:min-h-screen lg:w-1/4 lg:content-start lg:p-0 xl:w-1/5">
      <div className="lg:m-auto lg:p-6 lg:text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-black lowercase italic text-neutral-200 no-underline [font-family:var(--font-lato)] hover:text-white active:animate-scale-increase-fast lg:flex-col lg:text-4xl lg:leading-8"
        >
          <Image
            src="/images/form-delegate-logo.png"
            alt=""
            width={72}
            height={72}
            className="h-8 w-8 shrink-0 drop-shadow-sm lg:h-[4.5rem] lg:w-[4.5rem]"
            priority
          />
          <span className="lg:max-w-[4em]">Form Delegate</span>
        </Link>
      </div>
      <MobileMenu links={links} />
      <nav className="hidden lg:block lg:w-full lg:border-t-0 lg:bg-transparent lg:shadow-none">
        <ul>
          {links.map((link) => (
            <li key={link.name}>
              <Suspense
                fallback={
                  <Link
                    href={link.href}
                    className="block border-red-300 p-4 font-sans lowercase tracking-wide text-slate-300 hover:border-r-8 hover:bg-red-900 hover:text-white"
                  >
                    {link.name}
                  </Link>
                }
              >
                <NavLink
                  href={link.href}
                  name={link.name}
                  className="block border-red-300 p-4 font-sans lowercase tracking-wide text-slate-300 hover:border-r-8 hover:bg-red-900 hover:text-white"
                />
              </Suspense>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
