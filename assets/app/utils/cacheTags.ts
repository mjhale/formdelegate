export const plansCacheTag = 'plans';

export function profileCacheTag(userId: string | number) {
  return `profile:${userId}`;
}

export function teamCacheTag(teamId: string) {
  return `team:${teamId}`;
}

export function teamMembershipsCacheTag(teamId: string) {
  return `team:${teamId}:memberships`;
}

export function teamInvitationsCacheTag(teamId: string) {
  return `team:${teamId}:invitations`;
}

export function formsCacheTag(teamId: string) {
  return `team:${teamId}:forms`;
}

export function formCacheTag(teamId: string, formId: string) {
  return `team:${teamId}:form:${formId}`;
}
