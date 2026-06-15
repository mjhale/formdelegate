'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  assertTeamMembership,
  CURRENT_TEAM_COOKIE,
  fetchProfile,
  setCurrentTeamCookie,
} from 'utils/profile';

export async function logoutUser() {
  (await cookies()).delete('access_token');
  (await cookies()).delete('user_id');
  (await cookies()).delete(CURRENT_TEAM_COOKIE);

  redirect('/');
}

export async function selectTeam(formData: FormData) {
  const teamId = formData.get('team_id')?.toString();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const userId = cookieStore.get('user_id')?.value;

  if (!teamId || !accessToken || !userId) {
    throw new Error('Unable to select team.');
  }

  const profile = await fetchProfile(accessToken, userId);
  assertTeamMembership(profile, teamId);
  await setCurrentTeamCookie(teamId);

  revalidatePath('/', 'layout');
}
