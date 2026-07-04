'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  isInvitationAcceptanceDestination,
  safeRedirectPath,
} from 'utils/destination';

export default function NavLink({
  className,
  href,
  name,
  onClick,
}: {
  className: string;
  href: string;
  name: string;
  onClick?: () => void;
}) {
  const searchParams = useSearchParams();
  const destination = safeRedirectPath(searchParams.get('destination'), '');
  const resolvedHref =
    href === '/login' && isInvitationAcceptanceDestination(destination)
      ? `/login?${new URLSearchParams({ destination }).toString()}`
      : href;

  return (
    <Link href={resolvedHref} onClick={onClick} className={className}>
      {name}
    </Link>
  );
}
