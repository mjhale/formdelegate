defmodule FormDelegateWeb.TeamController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Teams
  alias FormDelegate.Teams.Team

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def update(conn, %{"team_id" => team_id, "team" => team_params}, current_user) do
    with {:ok, %Team{} = team} <- Teams.get_team_for_user(current_user, team_id),
         {:ok, %Team{} = team} <- Teams.update_team(current_user, team, team_params) do
      render(conn, "show.json", team: team)
    end
  end
end
