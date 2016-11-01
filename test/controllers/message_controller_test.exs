defmodule FormDelegate.MessageControllerTest do
  use FormDelegate.ConnCase

  test "requires account authentication on all actions", %{conn: conn} do
    Enum.each([
      get(conn, message_path(conn, :index)),
      get(conn, message_path(conn, :show, "1")),
      get(conn, message_path(conn, :edit, "1")),
      put(conn, message_path(conn, :update, "1", %{})),
      post(conn, message_path(conn, :create, %{})),
      delete(conn, message_path(conn, :delete, "1")),
    ], fn conn ->
      assert json_response(conn, 403)
      assert conn.halted
    end)
  end
end
