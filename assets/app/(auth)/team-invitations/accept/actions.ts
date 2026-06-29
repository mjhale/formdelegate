'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  CURRENT_TEAM_COOKIE,
  fetchProfile,
  setCurrentTeamCookie,
} from 'utils/profile';
import { invitationAcceptancePath } from 'utils/destination';

export interface AcceptInvitationState {
  message: string | null;
}

const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});

export async function acceptInvitationAction(
  _currentState: AcceptInvitationState,
  formData: FormData
): Promise<AcceptInvitationState> {
  const parsed = acceptInvitationSchema.safeParse({
    token: formData.get('token'),
  });

  if (!parsed.success) {
    return { message: 'Invitation link is missing.' };
  }

  const token = parsed.data.token;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const userId = cookieStore.get('user_id')?.value;

  if (!accessToken || !userId) {
    redirect(
      `/login?${new URLSearchParams({
        destination: invitationAcceptancePath(token),
      }).toString()}`
    );
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/v1/team-invitations/${encodeURIComponent(token)}/accept`,
    {
      cache: 'no-store',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const body = await safeJson(response);

    return {
      message: invitationErrorMessage(body?.error?.type),
    };
  }

  const { data } = await response.json();
  await refreshProfileTeamState(accessToken, userId, data.team?.id);

  redirect('/dashboard');
}

async function refreshProfileTeamState(
  accessToken: string,
  userId: string,
  acceptedTeamId: string | undefined
) {
  const profile = await fetchProfile(accessToken, userId);

  const selectedMembership =
    (acceptedTeamId &&
      profile.memberships.find(
        (membership) => membership.team.id === acceptedTeamId
      )) ||
    (profile.current_team &&
      profile.memberships.find(
        (membership) => membership.team.id === profile.current_team?.id
      )) ||
    profile.memberships[0];

  if (selectedMembership) {
    await setCurrentTeamCookie(selectedMembership.team.id);
  } else {
    (await cookies()).delete(CURRENT_TEAM_COOKIE);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/account/team');
  revalidatePath('/dashboard');
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}

function invitationErrorMessage(type: string | undefined) {
  switch (type) {
    case 'FORBIDDEN':
      return 'Sign in with the email address that received this invitation.';
    case 'INVALID_OR_EXPIRED_TOKEN':
    case 'PAGE_NOT_FOUND':
      return 'This invitation is invalid, expired, or no longer pending.';
    default:
      return 'Unable to accept this invitation.';
  }
}
