defmodule FormDelegateWeb.SessionControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.Factory
  alias FormDelegateWeb.Router.Helpers, as: Routes

  setup %{conn: conn, user: user} do
    jwt =
      case FormDelegateWeb.Guardian.encode_and_sign(user) do
        {:ok, jwt, _full_claims} ->
          jwt

        _ ->
          nil
      end

    {:ok, conn: put_req_header(conn, "accept", "application/json"), jwt: jwt}
  end

  describe "create/2" do
    @tag :as_inserted_user
    test "Creates, and responds with a newly created session if email and password credentials are valid",
         %{conn: conn, user: user} do
      credentials = %{email: Map.get(user, :email), password: Factory.valid_user_password()}

      response =
        conn
        |> post(Routes.session_path(conn, :create, session: credentials))
        |> json_response(200)

      assert response["data"]["token"]
    end

    @tag :as_inserted_user
    test "Returns an error and does not create a session if email and password credentials are invalid",
         %{conn: conn, user: user} do
      credentials = %{email: Map.get(user, :email), password: "wrongpassword"}

      response =
        conn
        |> post(Routes.session_path(conn, :create, session: credentials))
        |> json_response(401)

      expected = %{"error" => %{"code" => 401, "type" => "INVALID_CREDENTIALS"}}

      assert response == expected
    end

    test "Returns an error and does not create a session if email and password credentials are empty",
         %{conn: conn} do
      credentials = %{email: "", password: ""}

      response =
        conn
        |> post(Routes.session_path(conn, :create, session: credentials))
        |> json_response(401)

      expected = %{"error" => %{"code" => 401, "type" => "INVALID_CREDENTIALS"}}

      assert response == expected
    end
  end
end
