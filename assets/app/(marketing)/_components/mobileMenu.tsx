'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

import NavLink from './navLink';

export default function MobileMenu({ links }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden"
        aria-controls="main-menu"
        aria-expanded={isOpen}
      >
        {!isOpen ? (
          <>
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </>
        ) : (
          <>
            <span className="sr-only">Close main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </>
        )}
      </button>

      <nav
        className={clsx(
          'fixed inset-x-0 top-0 mt-12 h-auto w-full border-t-red-900 bg-red-900 shadow-md',
          {
            hidden: !isOpen,
          }
        )}
      >
        <ul>
          {links.map((link) => (
            <li key={link.name}>
              <Suspense
                fallback={
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block border-red-300 p-4 font-sans lowercase tracking-wide text-slate-300 hover:border-r-8 hover:bg-red-900 hover:text-white"
                  >
                    {link.name}
                  </Link>
                }
              >
                <NavLink
                  href={link.href}
                  name={link.name}
                  onClick={() => setIsOpen(false)}
                  className="block border-red-300 p-4 font-sans lowercase tracking-wide text-slate-300 hover:border-r-8 hover:bg-red-900 hover:text-white"
                />
              </Suspense>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
