defmodule FormDelegateWeb.TeamMembershipController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Teams
  alias FormDelegate.Teams.Team

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, %{"team_id" => team_id}, current_user) do
    with {:ok, %Team{} = team} <- Teams.get_team_for_user(current_user, team_id),
         {:ok, memberships} <- Teams.list_memberships(current_user, team) do
      render(conn, "index.json", memberships: memberships)
    end
  end

  def update(
        conn,
        %{"team_id" => team_id, "id" => id, "membership" => membership_params},
        current_user
      ) do
    with {:ok, %Team{} = team} <- Teams.get_team_for_user(current_user, team_id),
         {:ok, %Membership{} = membership} <-
           Teams.update_membership(current_user, team, %Membership{id: id}, membership_params) do
      render(conn, "show.json", membership: membership)
    end
  end

  def delete(conn, %{"team_id" => team_id, "id" => id}, current_user) do
    with {:ok, %Team{} = team} <- Teams.get_team_for_user(current_user, team_id),
         {:ok, %Membership{} = _membership} <-
           Teams.remove_membership(current_user, team, %Membership{id: id}) do
      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:no_content, "")
    end
  end
end
