defmodule FormDelegateWeb.Plugs.LoadCurrentTeam do
  import Ecto.Query, only: [from: 2]
  import Plug.Conn
  import Phoenix.Controller

  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Repo
  alias FormDelegate.Teams.Team

  def init(_), do: nil

  def call(%{assigns: %{current_user: current_user}} = conn, _opts) do
    with {:ok, %Membership{} = membership} <- get_membership(conn, current_user),
         %Membership{team: %Team{} = team} = membership <-
           Repo.preload(membership, team: [subscriptions: [:plan]]) do
      conn
      |> assign(:current_team, team)
      |> assign(:current_membership, membership)
    else
      {:error, :missing_team} ->
        render_not_found(conn)

      {:error, :not_found} ->
        render_not_found(conn)

      nil ->
        conn
        |> put_status(:forbidden)
        |> put_view(FormDelegateWeb.ErrorView)
        |> render(:"403")
        |> halt()
    end
  end

  def call(conn, _opts) do
    conn
    |> put_status(:unauthorized)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"401")
    |> halt()
  end

  defp render_not_found(conn) do
    conn
    |> put_status(:not_found)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"404")
    |> halt()
  end

  defp get_membership(%{path_params: %{"team_id" => team_id}}, current_user) do
    membership =
      Repo.one(
        from m in Membership,
          where: m.user_id == ^current_user.id and m.team_id == ^team_id
      )

    case membership do
      %Membership{} = membership -> {:ok, membership}
      nil -> {:error, :not_found}
    end
  end

  defp get_membership(_conn, current_user) do
    membership =
      Repo.one(
        from m in Membership,
          where: m.user_id == ^current_user.id,
          order_by: [asc: m.inserted_at],
          limit: 1
      )

    case membership do
      %Membership{} = membership -> {:ok, membership}
      nil -> {:error, :missing_team}
    end
  end
end
