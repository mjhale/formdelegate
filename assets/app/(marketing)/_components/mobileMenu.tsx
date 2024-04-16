'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import Link from 'next/link';

export default function MobileMenu({ links }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center w-8 h-8 justify-center text-sm text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden"
        aria-controls="main-menu"
        aria-expanded={isOpen}
      >
        {!isOpen ? (
          <>
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
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
              className="w-5 h-5"
            >
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </>
        )}
      </button>

      <nav
        className={clsx(
          'fixed top-0 inset-x-0 mt-12 w-full h-auto bg-red-900 border-t-red-900 shadow-md',
          {
            hidden: !isOpen,
          }
        )}
      >
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
    </>
  );
}
