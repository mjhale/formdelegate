defmodule FormDelegateWeb.RequestControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

  @valid_attrs %{
    name: "Drew Fo",
    email: "drew342194@gmail.com",
    message: "I have an issue with an order"
  }

  @valid_attrs_with_spam %{
    name: "Guaranteed Spam",
    email: "akismet-guaranteed-spam@example.com",
    message: "This is certainly spam: viagra-test-123."
  }

  @invalid_attrs %{}

  describe "process_request/2" do
    setup [:create_form]

    test "Responds with accepted with @valid_attrs", %{
      conn: conn,
      form: form
    } do
      response =
        conn
        |> post(Routes.request_path(conn, :create, form.id, request: @valid_attrs))
        |> json_response(202)

      expected = %{"message" => "Accepted"}

      assert response == expected
    end

    test "Responds with accepted with @valid_attrs_with_spam", %{
      conn: conn,
      form: form
    } do
      response =
        conn
        |> post(Routes.request_path(conn, :create, form.id, request: @valid_attrs_with_spam))
        |> json_response(202)

      expected = %{"message" => "Accepted"}

      assert response == expected
    end

    test "Responds with error with @invalid_attrs for existant form", %{
      conn: conn,
      form: form
    } do
      conn =
        conn
        |> post(Routes.request_path(conn, :create, form.id, request: @invalid_attrs))

      assert json_response(conn, 422)
    end

    test "Responds with error for nonexistant form", %{
      conn: conn
    } do
      assert_error_sent :not_found, fn ->
        conn
        |> post(Routes.request_path(conn, :create, Ecto.UUID.generate(), request: @valid_attrs))
        |> json_response(404)
      end
    end
  end

  defp create_form(_context) do
    user = FormDelegate.Factory.insert(:user)
    form = FormDelegate.Factory.insert(:form, user: user)

    {:ok, form: form}
  end
end
