defmodule FormDelegateWeb.MessageControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

  test "requires user authentication on all actions", %{conn: conn} do
    Enum.each(
      [
        get(conn, Routes.message_path(conn, :index)),
        get(conn, Routes.message_path(conn, :show, "1")),
        get(conn, Routes.message_path(conn, :recent_activity))
      ],
      fn conn ->
        assert json_response(conn, 401)
        assert conn.halted
      end
    )
  end
end
