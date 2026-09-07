'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/account', label: 'Profile', exact: true },
  { href: '/account/billing', label: 'Billing' },
  { href: '/account/team', label: 'Team' },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account sections"
      className="mb-[18px] ml-0 mr-0 mt-[-6px] flex gap-1 border-b border-b-[#e5ded3] pb-px"
    >
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            className={clsx(
              'relative border-0 bg-transparent px-3 pb-[11px] pt-2.5 text-xs font-[650] no-underline hover:text-brand-deep',
              active
                ? 'text-brand-deep after:absolute after:inset-x-[9px] after:-bottom-px after:h-0.5 after:rounded-t-sm after:bg-brand'
                : 'text-muted'
            )}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            key={tab.href}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
