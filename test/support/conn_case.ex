defmodule FormDelegateWeb.ConnCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting up a connection.

  Such tests rely on `Phoenix.ConnTest` and also
  import other functionality to make it easier
  to build and query models.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """

  use ExUnit.CaseTemplate
  import Ecto.Query, only: [from: 2]

  alias FormDelegate.Factory
  alias FormDelegate.BillingCounts
  alias FormDelegate.BillingCounts.BillingCount
  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Plans.Plan
  alias FormDelegate.Repo
  alias FormDelegate.Teams.Team

  using do
    quote do
      # Import conveniences for testing with connections
      import Plug.Conn
      import Phoenix.ConnTest

      import FormDelegateWeb.Router.Helpers
      import FormDelegate.Factory

      # The default endpoint for testing
      @endpoint FormDelegateWeb.Endpoint
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(FormDelegate.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(FormDelegate.Repo, {:shared, self()})
    end

    ensure_free_plan_exists()

    user =
      cond do
        tags[:as_admin] ->
          Factory.build(:user, is_admin: true)
          |> Factory.set_password(Factory.valid_user_password())

        tags[:as_inserted_admin] ->
          Factory.build(:user, is_admin: true)
          |> Factory.set_password(Factory.valid_user_password())
          |> Factory.insert()

        tags[:as_user] ->
          Factory.build(:user, is_admin: false)
          |> Factory.set_password(Factory.valid_user_password())

        tags[:as_inserted_user] ->
          Factory.build(:user)
          |> Factory.set_password(Factory.valid_user_password())
          |> Factory.insert()

        true ->
          nil
      end

    membership = ensure_membership_exists(user)
    ensure_billing_count_exists(membership)
    team = membership && Repo.preload(membership, :team).team

    conn =
      Phoenix.ConnTest.build_conn()
      |> Plug.Conn.assign(:current_user, user)

    {:ok, conn: conn, user: user, team: team, membership: membership}
  end

  defp ensure_free_plan_exists do
    case Repo.get_by(Plan, name: "Free") do
      nil ->
        Repo.insert!(%Plan{
          name: "Free",
          limit_submissions: 100,
          limit_forms: 0,
          limit_storage: 5_000_000
        })

      _plan ->
        :ok
    end
  end

  defp ensure_billing_count_exists(nil), do: :ok

  defp ensure_billing_count_exists(%Membership{team_id: team_id}) do
    case BillingCounts.get_latest_billing_count_of_team(team_id) do
      nil ->
        BillingCounts.create_billing_count(%BillingCount{}, %{
          team_id: team_id,
          submission_count: 0,
          storage_count: 0,
          form_count: 0
        })

      _billing_count ->
        :ok
    end
  end

  defp ensure_membership_exists(nil), do: nil

  defp ensure_membership_exists(%{id: user_id}) when is_nil(user_id), do: nil

  defp ensure_membership_exists(%{id: user_id}) do
    case Repo.one(from m in Membership, where: m.user_id == ^user_id, limit: 1) do
      nil ->
        team = Repo.insert!(%Team{})

        Repo.insert!(%Membership{
          user_id: user_id,
          team_id: team.id,
          is_billing_account: true
        })

      membership ->
        membership
    end
  end
end
