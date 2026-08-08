import type { Metadata } from 'next';
import type {
  TeamInvitation,
  TeamMembership,
  TeamMembershipUser,
} from 'types/user';

import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';

import {
  profileCacheTag,
  teamCacheTag,
  teamInvitationsCacheTag,
  teamMembershipsCacheTag,
} from 'utils/cacheTags';
import { getProfileContext } from 'utils/profile';

import { TeamManagementSkeleton } from '../../_components/skeletons';
import TeamManagement from './teamManagement';

export default async function AccountTeamPage() {
  return (
    <Suspense fallback={<TeamManagementSkeleton />}>
      <AccountTeamContent />
    </Suspense>
  );
}

async function AccountTeamContent() {
  const teamData = await fetchTeamManagementData();

  return <TeamManagement {...teamData} />;
}

async function fetchTeamManagementData() {
  'use cache: private';
  cacheLife({ stale: 60 * 5 });

  const { accessToken, profile, selectedMembership, selectedTeam } =
    await getProfileContext();
  cacheTag(
    profileCacheTag(profile.user.id),
    teamCacheTag(selectedTeam.id),
    teamMembershipsCacheTag(selectedTeam.id),
    teamInvitationsCacheTag(selectedTeam.id)
  );

  const canManageTeam =
    profile.user.is_admin || selectedMembership.is_billing_account;

  const [memberships, invitations] = canManageTeam
    ? await Promise.all([
        fetchTeamMemberships(accessToken, selectedTeam.id),
        fetchTeamInvitations(accessToken, selectedTeam.id),
      ])
    : [currentUserMembership(selectedMembership.id, profile.user), []];

  return {
    canManageTeam,
    currentUserId: profile.user.id,
    invitations,
    memberships,
    selectedTeam,
  };
}

async function fetchTeamMemberships(
  accessToken: string,
  teamId: string
): Promise<TeamMembership[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${teamId}/memberships`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Unable to fetch team members.');
  }

  const { data } = await response.json();

  return data;
}

async function fetchTeamInvitations(
  accessToken: string,
  teamId: string
): Promise<TeamInvitation[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/teams/${teamId}/invitations`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Unable to fetch team invitations.');
  }

  const { data } = await response.json();

  return data;
}

function currentUserMembership(
  membershipId: string,
  user: TeamMembershipUser
): TeamMembership[] {
  return [
    {
      id: membershipId,
      is_billing_account: false,
      user,
    },
  ];
}

export const metadata: Metadata = {
  title: 'Manage Team - Form Delegate',
  description: 'Manage team members and invitations.',
};
