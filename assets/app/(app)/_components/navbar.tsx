import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { logoutUser } from '../actions';

import NavLink from './navLink';
import TeamSwitcher from './teamSwitcher';

interface TeamOption {
  id: string;
  name: string;
}

export default function Navbar({
  email,
  name,
  selectedTeamId,
  teams,
  workspaceSubtitle,
}: {
  email: string;
  name: string;
  selectedTeamId: string;
  teams: TeamOption[];
  workspaceSubtitle: string;
}) {
  return (
    <aside
      aria-label="Primary navigation"
      className="max-lg:duration-drawer max-lg:ease-drawer motion-reduce:transition-none fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-r-[rgba(77,_19,_17,_0.32)] bg-sidebar text-[rgba(255,_255,_255,_0.94)] shadow-[8px_0_30px_rgba(59,_22,_17,_0.08)] max-lg:w-[min(276px,_calc(100vw_-_44px))] max-lg:-translate-x-[102%] max-lg:shadow-none max-lg:transition-transform max-lg:group-data-[menu-open=true]/app:translate-x-0"
    >
      <div className="border-b border-b-[rgba(255,_255,_255,_0.13)] pb-4 pl-[18px] pr-[18px] pt-5">
        <Link
          aria-label="Form Delegate dashboard"
          className="inline-flex items-center gap-2.5 text-white no-underline active:animate-scale-increase-fast motion-reduce:active:animate-none"
          href="/dashboard"
        >
          <Image
            alt=""
            className="h-11 w-11 flex-[0_0_44px] [filter:drop-shadow(0_2px_3px_rgba(70,_17,_15,_0.22))]"
            height={72}
            priority
            src="/images/form-delegate-logo.png"
            width={72}
          />
          <span className="flex flex-col font-brand text-[26px] font-black lowercase italic leading-[0.9] tracking-[-0.025em] text-[#fffaf4] [&_span:last-child]:ml-[13px]">
            <span>form</span>
            <span>delegate</span>
          </span>
        </Link>
      </div>

      <TeamSwitcher
        selectedTeamId={selectedTeamId}
        teams={teams}
        workspaceSubtitle={workspaceSubtitle}
      />

      <nav className="min-h-0 flex-1 overflow-y-auto pb-4 pl-3 pr-3 pt-3.5 [scrollbar-color:rgba(255,_255,_255,_0.2)_transparent] [scrollbar-width:thin]">
        <div className="[&+div]:mt-5">
          <div className="pb-[7px] pl-2.5 pr-2.5 pt-0 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[rgba(255,_255,_255,_0.52)]">
            Workspace
          </div>
          <NavLink exact href="/dashboard" icon="dashboard" label="Dashboard" />
          <NavLink exact href="/submissions" icon="inbox" label="Submissions" />
          <NavLink href="/forms" icon="forms" label="Forms" />
        </div>

        <div className="[&+div]:mt-5">
          <div className="pb-[7px] pl-2.5 pr-2.5 pt-0 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[rgba(255,_255,_255,_0.52)]">
            Account
          </div>
          <NavLink exact href="/account" icon="profile" label="Profile" />
          <NavLink href="/account/billing" icon="billing" label="Billing" />
          <NavLink href="/account/team" icon="team" label="Team" />
        </div>

        <div className="[&+div]:mt-5">
          <div className="pb-[7px] pl-2.5 pr-2.5 pt-0 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[rgba(255,_255,_255,_0.52)]">
            Help
          </div>
          <NavLink href="/support" icon="support" label="Support" />
        </div>
      </nav>

      <div className="border-t border-t-[rgba(255,_255,_255,_0.13)] p-3">
        <div className="flex items-center gap-2.5 rounded-[9px] px-[9px] py-2">
          <span className="grid h-8 w-8 flex-[0_0_32px] place-items-center rounded-full border border-[rgba(255,_255,_255,_0.3)] bg-[#f8e8ce] text-xs font-extrabold text-brand-dark">
            {initials(name || email)}
          </span>
          <span className="min-w-0 flex-1 [&_span]:block [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap [&_span]:text-[10px] [&_span]:text-[rgba(255,_255,_255,_0.6)] [&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:whitespace-nowrap [&_strong]:text-xs [&_strong]:font-bold">
            <strong>{name || email}</strong>
            <span>{email}</span>
          </span>
          <form action={logoutUser}>
            <button
              aria-label="Sign out"
              className="grid h-8 w-8 place-items-center rounded-[7px] border-0 bg-transparent p-0 text-[rgba(255,_255,_255,_0.72)] hover:bg-[rgba(255,_255,_255,_0.12)] hover:text-white [&_svg]:h-[17px] [&_svg]:w-[17px]"
              type="submit"
            >
              <LogOut aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase();
  }

  return value.slice(0, 2).toLocaleUpperCase();
}
