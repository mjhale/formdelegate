'use client';

import clsx from 'clsx';
import {
  CircleHelp,
  ClipboardList,
  CreditCard,
  Grid2X2,
  Inbox,
  UserRound,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({
  exact = false,
  href,
  icon,
  label,
}: {
  exact?: boolean;
  href: string;
  icon: IconName;
  label: string;
}) {
  const pathname = usePathname();
  const Icon = icons[icon];
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      className={clsx(
        'relative flex min-h-10 w-full items-center gap-[11px] rounded-lg px-[11px] py-[9px] text-[13px] font-semibold no-underline transition-colors duration-150 [&+a]:mt-1.5',
        active
          ? 'bg-white/[0.17] text-white shadow-nav-active'
          : 'text-white/[0.78] hover:bg-white/10 hover:text-white'
      )}
      href={href}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        aria-hidden="true"
        className="size-[18px] shrink-0"
        strokeWidth={1.8}
      />
      <span>{label}</span>
    </Link>
  );
}

type IconName =
  'billing' | 'dashboard' | 'forms' | 'inbox' | 'profile' | 'support' | 'team';

const icons = {
  billing: CreditCard,
  dashboard: Grid2X2,
  forms: ClipboardList,
  inbox: Inbox,
  profile: UserRound,
  support: CircleHelp,
  team: UsersRound,
} satisfies Record<IconName, typeof Grid2X2>;
