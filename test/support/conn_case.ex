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

    user =
      cond do
        tags[:as_admin] -> FormDelegate.Factory.build(:user, is_admin: true)
        tags[:as_inserted_admin] -> FormDelegate.Factory.insert(:user, is_admin: true)
        tags[:as_user] -> FormDelegate.Factory.build(:user, is_admin: false)
        tags[:as_inserted_user] -> FormDelegate.Factory.insert(:user, is_admin: false)
        true -> nil
      end

    conn =
      Phoenix.ConnTest.build_conn()
      |> Plug.Conn.assign(:current_user, user)

    {:ok, conn: conn, user: user}
  end
end
