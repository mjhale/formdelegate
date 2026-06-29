'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

import {
  CURRENT_TEAM_COOKIE,
  fetchProfile,
  getProfileContext,
  setCurrentTeamCookie,
} from 'utils/profile';

export interface TeamManagementActionState {
  errors: Record<string, string[]>;
  intent: string | null;
  message: string | null;
  ok: boolean;
}

const intentSchema = z.enum([
  'rename_team',
  'invite_member',
  'update_membership',
  'remove_membership',
  'cancel_invitation',
]);

const renameTeamSchema = z.object({
  name: z.string().trim().min(1, 'Team name is required.'),
});

const inviteMemberSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

const updateMembershipSchema = z.object({
  is_billing_account: z.enum(['true', 'false']),
  membership_id: z.string().trim().min(1, 'Membership is required.'),
});

const membershipIdSchema = z.object({
  membership_id: z.string().trim().min(1, 'Membership is required.'),
});

const invitationIdSchema = z.object({
  invitation_id: z.string().trim().min(1, 'Invitation is required.'),
});

export async function teamManagementAction(
  _currentState: TeamManagementActionState,
  formData: FormData
): Promise<TeamManagementActionState> {
  const intentResult = intentSchema.safeParse(formData.get('intent'));

  if (!intentResult.success) {
    return actionError('Unknown team action.', 'unknown');
  }

  const intent = intentResult.data;

  try {
    switch (intent) {
      case 'rename_team':
        return await renameTeam(formData, intent);
      case 'invite_member':
        return await inviteMember(formData, intent);
      case 'update_membership':
        return await updateMembership(formData, intent);
      case 'remove_membership':
        return await removeMembership(formData, intent);
      case 'cancel_invitation':
        return await cancelInvitation(formData, intent);
    }
  } catch (error) {
    return actionError('Unable to update team.', intent);
  }
}

async function renameTeam(formData: FormData, intent: string) {
  const parsed = renameTeamSchema.safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return actionError('Check the highlighted fields.', intent, parsed.error);
  }

  const context = await getProfileContext();
  const response = await teamRequest(
    context,
    `/v1/teams/${context.selectedTeam.id}`,
    {
      body: JSON.stringify({ team: { name: parsed.data.name } }),
      method: 'PATCH',
    }
  );

  if (!response.ok) {
    return responseError(response, intent);
  }

  await refreshTeamState(
    context.accessToken,
    context.userId,
    context.selectedTeam.id
  );

  return actionOk('Team updated.', intent);
}

async function inviteMember(formData: FormData, intent: string) {
  const parsed = inviteMemberSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return actionError('Check the highlighted fields.', intent, parsed.error);
  }

  const context = await getProfileContext();
  const response = await teamRequest(
    context,
    `/v1/teams/${context.selectedTeam.id}/invitations`,
    {
      body: JSON.stringify({ invitation: { email: parsed.data.email } }),
      method: 'POST',
    }
  );

  if (!response.ok) {
    return responseError(response, intent);
  }

  await refreshTeamState(
    context.accessToken,
    context.userId,
    context.selectedTeam.id
  );

  return actionOk('Invitation sent.', intent);
}

async function updateMembership(formData: FormData, intent: string) {
  const parsed = updateMembershipSchema.safeParse({
    is_billing_account: formData.get('is_billing_account'),
    membership_id: formData.get('membership_id'),
  });

  if (!parsed.success) {
    return actionError('Check the highlighted fields.', intent, parsed.error);
  }

  const context = await getProfileContext();
  const response = await teamRequest(
    context,
    `/v1/teams/${context.selectedTeam.id}/memberships/${parsed.data.membership_id}`,
    {
      body: JSON.stringify({
        membership: {
          is_billing_account: parsed.data.is_billing_account === 'true',
        },
      }),
      method: 'PATCH',
    }
  );

  if (!response.ok) {
    return responseError(response, intent);
  }

  await refreshTeamState(
    context.accessToken,
    context.userId,
    context.selectedTeam.id
  );

  return actionOk('Membership updated.', intent);
}

async function removeMembership(formData: FormData, intent: string) {
  const parsed = membershipIdSchema.safeParse({
    membership_id: formData.get('membership_id'),
  });

  if (!parsed.success) {
    return actionError('Check the highlighted fields.', intent, parsed.error);
  }

  const context = await getProfileContext();
  const response = await teamRequest(
    context,
    `/v1/teams/${context.selectedTeam.id}/memberships/${parsed.data.membership_id}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    return responseError(response, intent);
  }

  await refreshTeamState(
    context.accessToken,
    context.userId,
    context.selectedTeam.id
  );

  return actionOk('Member removed.', intent);
}

async function cancelInvitation(formData: FormData, intent: string) {
  const parsed = invitationIdSchema.safeParse({
    invitation_id: formData.get('invitation_id'),
  });

  if (!parsed.success) {
    return actionError('Check the highlighted fields.', intent, parsed.error);
  }

  const context = await getProfileContext();
  const response = await teamRequest(
    context,
    `/v1/teams/${context.selectedTeam.id}/invitations/${parsed.data.invitation_id}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    return responseError(response, intent);
  }

  await refreshTeamState(
    context.accessToken,
    context.userId,
    context.selectedTeam.id
  );

  return actionOk('Invitation cancelled.', intent);
}

async function teamRequest(
  context: Awaited<ReturnType<typeof getProfileContext>>,
  path: string,
  options: RequestInit
) {
  return fetch(`${process.env.NEXT_PUBLIC_API_HOST}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${context.accessToken}`,
      ...options.headers,
    },
  });
}

async function refreshTeamState(
  accessToken: string,
  userId: string,
  preferredTeamId: string
) {
  const profile = await fetchProfile(accessToken, userId);

  const selectedMembership =
    profile.memberships.find(
      (membership) => membership.team.id === preferredTeamId
    ) ||
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

  revalidatePath('/account/team');
  revalidatePath('/', 'layout');
}

async function responseError(response: Response, intent: string) {
  const body = await safeJson(response);
  const type = body?.error?.type;

  if (type === 'UNPROCESSABLE_ENTITY') {
    return actionError(
      'Check the highlighted fields.',
      intent,
      undefined,
      normalizeServerErrors(body?.error?.errors)
    );
  }

  return actionError(errorMessage(type), intent);
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}

function actionOk(message: string, intent: string): TeamManagementActionState {
  return {
    errors: {},
    intent,
    message,
    ok: true,
  };
}

function actionError(
  message: string,
  intent: string,
  parsedError?: z.ZodError,
  errors: Record<string, string[]> = {}
): TeamManagementActionState {
  return {
    errors: parsedError ? parsedError.flatten().fieldErrors : errors,
    intent,
    message,
    ok: false,
  };
}

function normalizeServerErrors(errors: unknown) {
  if (!errors || typeof errors !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.map(String) : [String(messages)],
    ])
  );
}

function errorMessage(type: string | undefined) {
  switch (type) {
    case 'ALREADY_TEAM_MEMBER':
      return 'That email is already a team member.';
    case 'DUPLICATE_INVITATION':
      return 'That email already has a pending invitation.';
    case 'FORBIDDEN':
      return 'You are not allowed to manage this team.';
    case 'LAST_TEAM_ADMIN':
      return 'A team must keep at least one billing admin.';
    case 'LAST_TEAM_MEMBER':
      return 'A team must keep at least one member.';
    case 'PAGE_NOT_FOUND':
      return 'The team record could not be found.';
    default:
      return 'Unable to update team.';
  }
}
