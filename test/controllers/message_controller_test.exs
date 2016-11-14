defmodule FormDelegate.MessageControllerTest do
  use FormDelegate.ConnCase

  import FormDelegate.Factory

  setup do
    account = insert(:account)
    {:ok, jwt, full_claims} = Guardian.encode_and_sign(account)
    {:ok, %{account: account, jwt: jwt, claims: full_claims}}
  end

  test "requires account authentication on all actions", %{conn: conn} do
    Enum.each([
      get(conn, message_path(conn, :index)),
      get(conn, message_path(conn, :show, "1")),
      post(conn, message_path(conn, :create, %{})),
      delete(conn, message_path(conn, :delete, "1")),
    ], fn conn ->
      assert json_response(conn, 403)
      assert conn.halted
    end)
  end
end
