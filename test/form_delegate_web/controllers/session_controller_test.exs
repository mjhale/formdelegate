defmodule FormDelegateWeb.SessionControllerTest do
  use FormDelegateWeb.ConnCase

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
    test "Creates, and responds with a newly created JWT if  email and password credentials are valid",
         %{conn: conn} do
      user =
        FormDelegate.Factory.build(:user)
        |> set_password("GqHglTZ1sP&a20X")
        |> FormDelegate.Factory.insert()

      credentials = %{email: Map.get(user, :email), password: "GqHglTZ1sP&a20X"}

      response =
        conn
        |> post(Routes.session_path(conn, :create, session: credentials))
        |> json_response(200)

      assert response["data"]["token"]
    end

    test "Returns an error and does not create a JWT if email and password credentials are invalid",
         %{conn: conn} do
      user =
        FormDelegate.Factory.build(:user)
        |> set_password("GqHglTZ1sP&a20X")
        |> FormDelegate.Factory.insert()

      credentials = %{email: Map.get(user, :email), password: "wrongpassword"}

      response =
        conn
        |> post(Routes.session_path(conn, :create, session: credentials))
        |> json_response(401)

      expected = %{"message" => "Bad credentials"}

      assert response == expected
    end

    test "Returns an error and does not create a JWT if email and password credentials are empty",
         %{conn: conn} do
      _user =
        FormDelegate.Factory.build(:user)
        |> set_password("GqHglTZ1sP&a20X")
        |> FormDelegate.Factory.insert()

      credentials = %{email: "", password: ""}

      response =
        conn
        |> post(Routes.session_path(conn, :create, session: credentials))
        |> json_response(401)

      expected = %{"message" => "Bad credentials"}

      assert response == expected
    end
  end
end
