import type { Metadata } from 'next';

import Link from 'next/link';
import { Suspense } from 'react';

import { getProfileContext } from 'utils/profile';

import MobileMenu from './_components/mobileMenu';
import NavBar from './_components/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-sm leading-[1.45] text-[#20242b]">
      <Suspense fallback={<NavBarFallback />}>
        <AuthenticatedNavBar />
      </Suspense>
      <Suspense fallback={null}>
        <MobileMenu />
      </Suspense>

      <div className="ml-[256px] min-h-screen bg-canvas bg-workspace [background-size:34px_34px] max-lg:ml-0 max-lg:pt-[62px]">
        <div className="min-h-screen min-w-0">
          <main className="mx-auto w-full max-w-[1420px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8 xl:px-14">
            {children}
          </main>

          <footer className="mx-auto flex w-full max-w-[1420px] flex-wrap justify-center gap-x-5 gap-y-2 px-6 pb-8 text-xs text-slate-500 lg:justify-start lg:px-10 xl:px-14">
            <a
              href="https://github.com/mjhale/formdelegate"
              className="hover:text-slate-900 hover:underline"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
            <Link
              href="/privacy"
              className="hover:text-slate-900 hover:underline"
              prefetch={false}
            >
              Privacy Policy
            </Link>
            <Link
              href="/tos"
              className="hover:text-slate-900 hover:underline"
              prefetch={false}
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="hover:text-slate-900 hover:underline"
              prefetch={false}
            >
              Contact
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}

async function AuthenticatedNavBar() {
  const { profile, selectedTeam } = await getProfileContext();
  const teams = profile.memberships.map((membership, index) => ({
    id: membership.team.id,
    name: membership.team.name || `Team ${index + 1}`,
  }));
  const planName = selectedTeam.subscriptions?.[0]?.plan?.name || 'Free';

  return (
    <NavBar
      email={profile.user.email}
      name={profile.user.name || profile.user.email}
      selectedTeamId={selectedTeam.id}
      teams={teams}
      workspaceSubtitle={`${planName} workspace`}
    />
  );
}

function NavBarFallback() {
  return (
    <aside
      aria-hidden="true"
      className="max-lg:duration-drawer max-lg:ease-drawer motion-reduce:transition-none fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-r-[rgba(77,_19,_17,_0.32)] bg-sidebar text-[rgba(255,_255,_255,_0.94)] opacity-[0.92] shadow-[8px_0_30px_rgba(59,_22,_17,_0.08)] max-lg:w-[min(276px,_calc(100vw_-_44px))] max-lg:-translate-x-[102%] max-lg:shadow-none max-lg:transition-transform max-lg:group-data-[menu-open=true]/app:translate-x-0"
    />
  );
}

export const metadata: Metadata = {
  title: 'Form Delegate',
  description:
    'Form Delegate is a simple and secure form management solution for surveys, registrations, feedback, and more. No server code required.',
};
