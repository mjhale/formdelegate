defmodule FormDelegateWeb.TeamInvitationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Teams
  alias FormDelegate.Teams.{Team, TeamInvitation}

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, %{"team_id" => team_id}, current_user) do
    with {:ok, %Team{} = team} <- Teams.get_team_for_user(current_user, team_id),
         {:ok, invitations} <- Teams.list_invitations(current_user, team) do
      render(conn, "index.json", invitations: invitations)
    end
  end

  def create(conn, %{"team_id" => team_id, "invitation" => invitation_params}, current_user) do
    with {:ok, %Team{} = team} <- Teams.get_team_for_user(current_user, team_id),
         {:ok, %TeamInvitation{} = invitation} <-
           Teams.create_invitation(current_user, team, invitation_params) do
      conn
      |> put_status(:created)
      |> render("show.json", invitation: invitation)
    end
  end

  def delete(conn, %{"team_id" => team_id, "id" => id}, current_user) do
    with {:ok, %Team{} = team} <- Teams.get_team_for_user(current_user, team_id),
         {:ok, %TeamInvitation{} = _invitation} <-
           Teams.cancel_invitation(current_user, team, %TeamInvitation{id: id}) do
      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:no_content, "")
    end
  end

  def accept(conn, %{"token" => token}, current_user) do
    with {:ok, %TeamInvitation{} = invitation} <- Teams.accept_invitation(current_user, token) do
      render(conn, "show.json", invitation: invitation)
    end
  end
end
