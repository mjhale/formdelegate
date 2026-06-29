'use client';

import type { Team, TeamInvitation, TeamMembership } from 'types/user';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  teamManagementAction,
  type TeamManagementActionState,
} from './actions';

const initialState: TeamManagementActionState = {
  errors: {},
  intent: null,
  message: null,
  ok: false,
};

const buttonClass =
  'inline-flex items-center justify-center px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-nowrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer';

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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-3xl lowercase tracking-wide font-semibold">Team</h1>
      </div>

      <hr className="bg-slate-100 mb-5" />

      {state.message && (
        <p
          aria-live="polite"
          className={`mb-4 text-sm ${state.ok ? 'text-emerald-700' : 'text-red-600'}`}
        >
          {state.message}
        </p>
      )}

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-3">Team details</h2>

          {canManageTeam ? (
            <form
              action={formAction}
              className="flex flex-col gap-3 sm:flex-row sm:items-start"
            >
              <input type="hidden" name="intent" value="rename_team" />
              <div className="w-full max-w-md">
                <label className="sr-only" htmlFor="team-name">
                  Team name
                </label>
                <input
                  aria-describedby="team-name-error"
                  className="w-full appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
                  defaultValue={teamName}
                  id="team-name"
                  name="name"
                  type="text"
                />
                {state.intent === 'rename_team' && state.errors.name && (
                  <FieldErrors
                    errors={state.errors.name}
                    id="team-name-error"
                  />
                )}
              </div>
              <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
            </form>
          ) : (
            <div className="flex items-center h-12">
              <div className="flex-0 w-1/4 max-w-32 font-semibold">Name</div>
              <div className="flex-1">{teamName}</div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Members</h2>
          <div className="overflow-x-auto bg-white border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Name
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Role
                  </th>
                  {canManageTeam && (
                    <th
                      className="px-4 py-3 font-semibold text-right"
                      scope="col"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
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
        </section>

        {canManageTeam && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Invitations</h2>

            <form
              action={formAction}
              className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start"
            >
              <input type="hidden" name="intent" value="invite_member" />
              <div className="w-full max-w-md">
                <label className="sr-only" htmlFor="invitation-email">
                  Email
                </label>
                <input
                  aria-describedby="invitation-email-error"
                  className="w-full appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
                  id="invitation-email"
                  name="email"
                  placeholder="email@example.com"
                  type="email"
                />
                {state.intent === 'invite_member' && state.errors.email && (
                  <FieldErrors
                    errors={state.errors.email}
                    id="invitation-email-error"
                  />
                )}
              </div>
              <SubmitButton pendingLabel="Sending...">Send invite</SubmitButton>
            </form>

            {invitations.length > 0 ? (
              <div className="overflow-x-auto bg-white border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold" scope="col">
                        Email
                      </th>
                      <th className="px-4 py-3 font-semibold" scope="col">
                        Invited by
                      </th>
                      <th className="px-4 py-3 font-semibold" scope="col">
                        Expires
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-right"
                        scope="col"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
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
              <p className="text-sm text-slate-600">No pending invitations.</p>
            )}
          </section>
        )}
      </div>
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
      <td className="px-4 py-3 font-medium text-slate-900">
        {membership.user.name || membership.user.email}
        {isCurrentUser && <span className="ml-2 text-slate-500">(you)</span>}
      </td>
      <td className="px-4 py-3 text-slate-700">{membership.user.email}</td>
      <td className="px-4 py-3 text-slate-700">
        {membership.is_billing_account ? 'Billing admin' : 'Member'}
      </td>
      {canManageTeam && (
        <td className="px-4 py-3">
          <div className="flex flex-wrap justify-end gap-2">
            {canChangeRole && (
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
                <SubmitButton pendingLabel="Updating..." variant="secondary">
                  {membership.is_billing_account
                    ? 'Remove admin'
                    : 'Make admin'}
                </SubmitButton>
              </form>
            )}

            {canRemove && (
              <form action={formAction}>
                <input type="hidden" name="intent" value="remove_membership" />
                <input
                  type="hidden"
                  name="membership_id"
                  value={membership.id}
                />
                <SubmitButton pendingLabel="Removing..." variant="danger">
                  Remove
                </SubmitButton>
              </form>
            )}
          </div>
        </td>
      )}
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
      <td className="px-4 py-3 font-medium text-slate-900">
        {invitation.email}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {invitation.inviter?.name || invitation.inviter?.email || 'Unknown'}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {formatDate(invitation.expires_at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <form action={formAction}>
            <input type="hidden" name="intent" value="cancel_invitation" />
            <input type="hidden" name="invitation_id" value={invitation.id} />
            <SubmitButton pendingLabel="Cancelling..." variant="danger">
              Cancel
            </SubmitButton>
          </form>
        </div>
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
    <button
      aria-disabled={pending}
      className={`${buttonClass} ${
        variant === 'danger'
          ? 'text-red-700 hover:text-red-800'
          : 'text-gray-600'
      }`}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

function FieldErrors({ errors, id }: { errors: string[]; id: string }) {
  return (
    <div aria-atomic="true" aria-live="polite" id={id}>
      {errors.map((error) => (
        <p className="mt-2 text-sm text-red-500" key={error}>
          {error}
        </p>
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
