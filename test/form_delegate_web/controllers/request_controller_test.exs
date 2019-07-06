defmodule FormDelegateWeb.RequestControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

  @valid_attrs %{
    name: "Drew Fo",
    email: "drew342194@gmail.com",
    message: "I have an issue with an order"
  }

  test "process_request/2", %{conn: conn} do
    user = FormDelegate.Factory.insert(:user)
    form = FormDelegate.Factory.insert(:form, user: user)

    response =
      conn
      |> post(Routes.request_path(conn, :create, form.id, request: @valid_attrs))
      |> json_response(202)

    expected = %{"message" => "Accepted"}

    assert response == expected
  end
end
