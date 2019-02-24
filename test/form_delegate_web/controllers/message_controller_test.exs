defmodule FormDelegateWeb.MessageControllerTest do
  use FormDelegateWeb.ConnCase

  import FormDelegate.Factory

  alias FormDelegateWeb.Router.Helpers, as: Routes

  setup do
    user = insert(:user)
    {:ok, jwt, full_claims} = FormDelegateWeb.Guardian.encode_and_sign(user)
    {:ok, %{user: user, jwt: jwt, claims: full_claims}}
  end

  test "requires user authentication on all actions", %{conn: conn} do
    Enum.each([
      get(conn, Routes.message_path(conn, :index)),
      get(conn, Routes.message_path(conn, :show, "1")),
      post(conn, Routes.message_path(conn, :create, %{})),
      delete(conn, Routes.message_path(conn, :delete, "1")),
    ], fn conn ->
      assert json_response(conn, 403)
      assert conn.halted
    end)
  end
end
