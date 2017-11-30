defmodule FormDelegateWeb.PageControllerTest do
  use FormDelegateWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get conn, "/"
    assert html_response(conn, 200) =~ "Form Delegate"
  end
end
