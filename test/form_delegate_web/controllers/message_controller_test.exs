defmodule FormDelegateWeb.MessageControllerTest do
  use FormDelegateWeb.ConnCase

  import FormDelegate.Factory

  setup do
    user = insert(:user)
    {:ok, jwt, full_claims} = FormDelegateWeb.Guardian.encode_and_sign(user)
    {:ok, %{user: user, jwt: jwt, claims: full_claims}}
  end

  test "requires user authentication on all actions", %{conn: conn} do
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
