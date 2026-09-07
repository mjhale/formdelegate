'use client';

import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MobileMenu() {
  const pathname = usePathname();
  const [openAtPathname, setOpenAtPathname] = useState<string | null>(null);
  const isOpen = openAtPathname === pathname;

  useEffect(() => {
    document.body.dataset.menuOpen = String(isOpen);

    return () => {
      delete document.body.dataset.menuOpen;
    };
  }, [isOpen]);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setOpenAtPathname(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenAtPathname(null);
    };

    window.addEventListener('resize', closeOnDesktop);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('resize', closeOnDesktop);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <>
      <button
        aria-label="Close navigation"
        className={clsx(
          'fixed inset-0 z-[35] border-0 bg-[#281813]/[0.48] transition-opacity duration-200 motion-reduce:transition-none lg:hidden',
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
        onClick={() => setOpenAtPathname(null)}
        type="button"
      />
      <header className="hidden max-lg:fixed max-lg:inset-x-0 max-lg:top-0 max-lg:z-30 max-lg:flex max-lg:h-[62px] max-lg:items-center max-lg:justify-between max-lg:border-b max-lg:border-b-[#ded8cb] max-lg:bg-[rgba(255,_252,_245,_0.95)] max-lg:px-3.5 max-lg:py-0 max-lg:text-brand-dark max-lg:shadow-[0_2px_14px_rgba(61,_39,_25,_0.06)] max-lg:backdrop-blur-[10px]">
        <Link
          aria-label="Form Delegate dashboard"
          className="active:animate-scale-increase-fast motion-reduce:active:animate-none max-lg:flex max-lg:items-center max-lg:gap-2 max-lg:font-brand max-lg:text-2xl max-lg:font-black max-lg:lowercase max-lg:italic max-lg:leading-none max-lg:tracking-[-0.025em] max-lg:text-brand max-lg:no-underline max-lg:[&_img]:h-[34px] max-lg:[&_img]:w-[34px]"
          href="/dashboard"
        >
          <Image
            alt=""
            height={40}
            priority
            src="/images/form-delegate-logo.png"
            width={40}
          />
          <span>form delegate</span>
        </Link>
        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          className="max-lg:grid max-lg:h-[38px] max-lg:w-[38px] max-lg:place-items-center max-lg:rounded-lg max-lg:border max-lg:border-[#ded8cb] max-lg:bg-white max-lg:p-0 max-lg:text-brand max-lg:focus-visible:outline-offset-2 max-lg:focus-visible:[outline:2px_solid_rgba(191,_69,_61,_0.35)] max-lg:[&_svg]:h-5 max-lg:[&_svg]:w-5"
          onClick={() => setOpenAtPathname(isOpen ? null : pathname)}
          type="button"
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>
    </>
  );
}
