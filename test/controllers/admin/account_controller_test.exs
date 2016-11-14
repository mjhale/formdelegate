defmodule FormDelegate.AdminAccountControllerTest do
  use FormDelegate.ConnCase

  import FormDelegate.Factory

  setup do
    account = insert(:account)
    {:ok, jwt, full_claims} = Guardian.encode_and_sign(account)
    {:ok, %{account: account, jwt: jwt, claims: full_claims}}
  end

  test "requires authentication on all actions", %{conn: conn} do
    Enum.each([
      get(conn, account_path(conn, :index)),
      get(conn, account_path(conn, :show, "1")),
      get(conn, account_path(conn, :edit, "1")),
      put(conn, account_path(conn, :update, "1", %{})),
      post(conn, account_path(conn, :create, %{})),
      delete(conn, account_path(conn, :delete, "1")),
    ], fn conn ->
      assert json_response(conn, 403)
      assert conn.halted
    end)
  end
end
