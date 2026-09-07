'use client';

import type { TeamManagementActionState } from './actions';
import type { Team, TeamInvitation, TeamMembership } from 'types/user';

import { Plus } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { teamManagementAction } from './actions';

import AccountNav from '../../_components/accountNav';
import { Button as ActionButton, ButtonAnchor } from '../../_components/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../_components/card';
import EmptyState from '../../_components/emptyState';
import { Input } from '../../_components/input';

const initialState: TeamManagementActionState = {
  errors: {},
  intent: null,
  message: null,
  ok: false,
};

export default function TeamManagement({
  canManageTeam,
  currentUserId,
  invitations,
  memberships,
  selectedTeam,
}: {
  canManageTeam: boolean;
  currentUserId: number;
  invitations: TeamInvitation[];
  memberships: TeamMembership[];
  selectedTeam: Team;
}) {
  const [state, formAction] = useActionState(
    teamManagementAction,
    initialState
  );
  const billingMemberCount = memberships.filter(
    (membership) => membership.is_billing_account
  ).length;
  const teamName = selectedTeam.name || 'Team';

  return (
    <>
      <header className="mb-[18px] flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px] [&_h1]:mb-[7px] [&_h1]:ml-0 [&_h1]:mr-0 [&_h1]:mt-0 [&_h1]:text-[clamp(27px,_2.3vw,_34px)] [&_h1]:font-bold [&_h1]:leading-[1.15] [&_h1]:tracking-[-0.035em] [&_h1]:text-[#202126]">
        <div className="min-w-0">
          <p className="mb-1.5 ml-0 mr-0 mt-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#a33a34]">
            Workspace access
          </p>
          <h1>Team</h1>
          <p className="m-0 max-w-[660px] text-sm leading-[1.45] text-muted">
            Manage the workspace name, members, invitations, and roles.
          </p>
        </div>
        {canManageTeam ? (
          <div className="flex flex-[0_0_auto] gap-[9px] max-lg:w-full max-lg:[&>a]:flex-1 max-lg:[&>button]:flex-1">
            <ButtonAnchor variant={'primary'} href="#team-invitations">
              <Plus aria-hidden="true" />
              Invite member
            </ButtonAnchor>
          </div>
        ) : null}
      </header>

      <AccountNav />

      {state.message ? (
        <p
          aria-live="polite"
          className={`[margin:0_0_14px] py-2.5 px-3 rounded-[8px] text-xs ${
            state.ok
              ? 'border border-[#c9e5d9] bg-[#eaf7f1] text-[#24725a]'
              : 'border border-[#efc2bc] bg-brand-soft text-brand-dark'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <Card className="[&+section]:mt-[18px]">
        <CardHeader>
          <div>
            <CardTitle>Workspace details</CardTitle>
            <CardDescription>
              Identity and defaults shared by team members.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
          <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
            <strong>Workspace name</strong>
            <p>Shown in the workspace switcher.</p>
          </div>
          <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
            {canManageTeam ? (
              <form
                action={formAction}
                className="flex flex-wrap items-start gap-2"
              >
                <input type="hidden" name="intent" value="rename_team" />
                <div className="flex-1">
                  <Input
                    aria-describedby="team-name-error"
                    className="flex-[1_1_240px]"
                    defaultValue={teamName}
                    id="team-name"
                    name="name"
                    type="text"
                  />
                  {state.intent === 'rename_team' ? (
                    <FieldErrors
                      errors={state.errors.name}
                      id="team-name-error"
                    />
                  ) : null}
                </div>
                <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
              </form>
            ) : (
              teamName
            )}
          </div>
          <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1" />
        </div>

        <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
          <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
            <strong>Workspace ID</strong>
            <p>Used in API and support requests.</p>
          </div>
          <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
            <code>{selectedTeam.id}</code>
          </div>
          <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1" />
        </div>
      </Card>

      <Card className="[&+section]:mt-[18px]">
        <CardHeader>
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {memberships.length.toLocaleString()}{' '}
              {memberships.length === 1 ? 'member has' : 'members have'} access.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs [border-collapse:collapse] [&_td:last-child]:text-right [&_td]:border-t [&_td]:border-t-[#e5ded3] [&_td]:px-4 [&_td]:py-[13px] [&_td]:[vertical-align:middle] [&_th:last-child]:text-right [&_th]:bg-[rgba(247,_240,_226,_0.35)] [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-[0.055em] [&_th]:text-[#888990]">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Role</th>
                {canManageTeam ? <th scope="col">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {memberships.map((membership) => (
                <MemberRow
                  billingMemberCount={billingMemberCount}
                  canManageTeam={canManageTeam}
                  currentUserId={currentUserId}
                  formAction={formAction}
                  key={membership.id}
                  membership={membership}
                  membershipCount={memberships.length}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {canManageTeam ? (
        <Card className="[&+section]:mt-[18px]" id="team-invitations">
          <CardHeader>
            <div>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Invite new members or cancel pending invitations.
              </CardDescription>
            </div>
          </CardHeader>
          <div className="p-5">
            <form
              action={formAction}
              className="flex flex-wrap items-start gap-2"
            >
              <input type="hidden" name="intent" value="invite_member" />
              <div className="flex-1">
                <label
                  className="mb-1.5 block text-[11px] font-[650] text-[#45464c]"
                  htmlFor="invitation-email"
                >
                  Email address
                </label>
                <Input
                  aria-describedby="invitation-email-error"
                  className="flex-[1_1_240px]"
                  id="invitation-email"
                  name="email"
                  placeholder="email@example.com"
                  type="email"
                />
                {state.intent === 'invite_member' ? (
                  <FieldErrors
                    errors={state.errors.email}
                    id="invitation-email-error"
                  />
                ) : null}
              </div>
              <SubmitButton pendingLabel="Sending…">Send invite</SubmitButton>
            </form>
          </div>

          {invitations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs [border-collapse:collapse] [&_td:last-child]:text-right [&_td]:border-t [&_td]:border-t-[#e5ded3] [&_td]:px-4 [&_td]:py-[13px] [&_td]:[vertical-align:middle] [&_th:last-child]:text-right [&_th]:bg-[rgba(247,_240,_226,_0.35)] [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-[0.055em] [&_th]:text-[#888990]">
                <thead>
                  <tr>
                    <th scope="col">Email</th>
                    <th scope="col">Invited by</th>
                    <th scope="col">Expires</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation) => (
                    <InvitationRow
                      formAction={formAction}
                      invitation={invitation}
                      key={invitation.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No pending invitations"
              description="New invitations will appear here until your teammates accept them."
            />
          )}
        </Card>
      ) : null}
    </>
  );
}

function MemberRow({
  billingMemberCount,
  canManageTeam,
  currentUserId,
  formAction,
  membership,
  membershipCount,
}: {
  billingMemberCount: number;
  canManageTeam: boolean;
  currentUserId: number;
  formAction: (payload: FormData) => void;
  membership: TeamMembership;
  membershipCount: number;
}) {
  const isCurrentUser = membership.user.id === currentUserId;
  const canChangeRole =
    canManageTeam && (!membership.is_billing_account || billingMemberCount > 1);
  const canRemove =
    canManageTeam &&
    membershipCount > 1 &&
    (!membership.is_billing_account || billingMemberCount > 1);

  return (
    <tr>
      <td>
        <div className="font-[680] text-[#303137]">
          {membership.user.name || membership.user.email}
          {isCurrentUser ? ' (you)' : ''}
        </div>
        <div className="mt-0.5 text-[10px] text-muted">
          {membership.user.email}
        </div>
      </td>
      <td>{membership.is_billing_account ? 'Billing admin' : 'Member'}</td>
      {canManageTeam ? (
        <td>
          <div className="flex flex-wrap justify-end gap-[7px]">
            {canChangeRole ? (
              <form action={formAction}>
                <input type="hidden" name="intent" value="update_membership" />
                <input
                  type="hidden"
                  name="membership_id"
                  value={membership.id}
                />
                <input
                  type="hidden"
                  name="is_billing_account"
                  value={membership.is_billing_account ? 'false' : 'true'}
                />
                <SubmitButton pendingLabel="Updating…">
                  {membership.is_billing_account
                    ? 'Remove admin'
                    : 'Make admin'}
                </SubmitButton>
              </form>
            ) : null}
            {canRemove ? (
              <form action={formAction}>
                <input type="hidden" name="intent" value="remove_membership" />
                <input
                  type="hidden"
                  name="membership_id"
                  value={membership.id}
                />
                <SubmitButton pendingLabel="Removing…" variant="danger">
                  Remove
                </SubmitButton>
              </form>
            ) : null}
          </div>
        </td>
      ) : null}
    </tr>
  );
}

function InvitationRow({
  formAction,
  invitation,
}: {
  formAction: (payload: FormData) => void;
  invitation: TeamInvitation;
}) {
  return (
    <tr>
      <td>{invitation.email}</td>
      <td>
        {invitation.inviter?.name || invitation.inviter?.email || 'Unknown'}
      </td>
      <td>{formatDate(invitation.expires_at)}</td>
      <td>
        <form
          action={formAction}
          className="flex flex-wrap justify-end gap-[7px]"
        >
          <input type="hidden" name="intent" value="cancel_invitation" />
          <input type="hidden" name="invitation_id" value={invitation.id} />
          <SubmitButton pendingLabel="Cancelling…" variant="danger">
            Cancel
          </SubmitButton>
        </form>
      </td>
    </tr>
  );
}

function SubmitButton({
  children,
  pendingLabel,
  variant = 'secondary',
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: 'danger' | 'secondary';
}) {
  const { pending } = useFormStatus();

  return (
    <ActionButton
      size="small"
      variant={variant === 'danger' ? 'danger' : 'default'}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </ActionButton>
  );
}

function FieldErrors({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;

  return (
    <div
      aria-live="polite"
      className="mb-0 ml-0 mr-0 mt-1.5 text-[11px] text-brand-deep"
      id={id}
    >
      {errors.map((error) => (
        <p key={error}>{error}</p>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
