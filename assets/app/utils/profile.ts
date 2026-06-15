import type { Membership, Profile, Team } from 'types/user';

import { cache } from 'react';
import { cookies } from 'next/headers';

export const CURRENT_TEAM_COOKIE = 'current_team_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface ProfileContext {
  accessToken: string;
  profile: Profile;
  selectedMembership: Membership;
  selectedTeam: Team;
  userId: string;
}

export async function setCurrentTeamCookie(teamId: string) {
  (await cookies()).set({
    name: CURRENT_TEAM_COOKIE,
    value: teamId,
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV !== 'development',
  });
}

export async function fetchProfile(
  accessToken: string,
  userId: string
): Promise<Profile> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/${userId}`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Unable to fetch user profile.');
  }

  const { data } = await res.json();

  return data;
}

export const getProfileContext = cache(async (): Promise<ProfileContext> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const userId = cookieStore.get('user_id')?.value;

  if (!accessToken || !userId) {
    throw new Error('Missing authenticated user cookies.');
  }

  const profile = await fetchProfile(accessToken, userId);
  const selectedTeamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  const selectedMembership =
    (selectedTeamId &&
      profile.memberships.find((membership) => membership.team.id === selectedTeamId)) ||
    (profile.current_team &&
      profile.memberships.find(
        (membership) => membership.team.id === profile.current_team?.id
      )) ||
    profile.memberships[0];

  if (!selectedMembership) {
    throw new Error('Authenticated user does not belong to a team.');
  }

  return {
    accessToken,
    profile,
    selectedMembership,
    selectedTeam: selectedMembership.team,
    userId,
  };
});

export function assertTeamMembership(profile: Profile, teamId: string) {
  const membership = profile.memberships.find(
    (membership) => membership.team.id === teamId
  );

  if (!membership) {
    throw new Error('Selected team is not available to the current user.');
  }

  return membership;
}
