defmodule FormDelegateWeb.TeamInvitationView do
  use FormDelegateWeb, :view

  alias FormDelegateWeb.TeamInvitationView

  def render("index.json", %{invitations: invitations}) do
    %{data: render_many(invitations, TeamInvitationView, "invitation.json")}
  end

  def render("show.json", %{invitation: invitation}) do
    %{data: render_one(invitation, TeamInvitationView, "invitation.json")}
  end

  def render("invitation.json", %{team_invitation: invitation}) do
    %{
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      expires_at: DateTime.to_iso8601(invitation.expires_at),
      accepted_at: render_accepted_at(invitation.accepted_at),
      team: render_team(invitation.team),
      inviter: render_user(invitation.inviter)
    }
  end

  defp render_accepted_at(nil), do: nil
  defp render_accepted_at(accepted_at), do: DateTime.to_iso8601(accepted_at)

  defp render_team(team) do
    %{
      id: team.id,
      name: team.name
    }
  end

  defp render_user(nil), do: nil

  defp render_user(user) do
    %{
      id: user.id,
      email: user.email,
      name: user.name
    }
  end
end
