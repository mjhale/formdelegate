defmodule FormDelegateWeb.IntegrationControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

  @update_attrs %{
    type: "Keybase"
  }
  @invalid_attrs %{type: nil}

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

  @tag :as_inserted_user
  test "index/3 responds with all integrations", %{conn: conn, jwt: jwt} do
    integration = FormDelegate.Factory.insert(:integration)

    response =
      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> get(Routes.integration_path(conn, :index))
      |> json_response(200)

    expected = %{"data" => [%{"id" => integration.id, "type" => integration.type}]}

    assert response == expected
  end

  @tag :as_inserted_user
  describe "show/3" do
    test "Responds with integration info if the integration is found", %{conn: conn, jwt: jwt} do
      integration = FormDelegate.Factory.insert(:integration)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.integration_path(conn, :show, integration.id))
        |> json_response(200)

      expected = %{"data" => %{"id" => integration.id, "type" => integration.type}}

      assert response == expected
    end

    @tag :as_inserted_user
    test "Responds with a submission indicating integration not found", %{conn: conn, jwt: jwt} do
      assert_error_sent :not_found, fn ->
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.integration_path(conn, :show, -1))
        |> json_response(404)
      end
    end
  end

  describe "update/3" do
    @tag :as_inserted_admin
    test "Edits as admin, and responds with the integration if attributes are valid", %{
      conn: conn,
      jwt: jwt
    } do
      integration = FormDelegate.Factory.insert(:integration)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.integration_path(conn, :update, integration.id), integration: @update_attrs)
        |> json_response(200)

      expected = %{
        "data" => %{
          "type" => "Keybase",
          "id" => integration.id
        }
      }

      assert response == expected
    end

    @tag :as_inserted_admin
    test "Returns an error and does not edit the integration as admin if attributes are invalid",
         %{conn: conn, jwt: jwt} do
      integration = FormDelegate.Factory.insert(:integration)

      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> put(Routes.integration_path(conn, :update, integration.id), integration: @invalid_attrs)
      |> json_response(:unprocessable_entity)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.integration_path(conn, :show, integration.id))
        |> json_response(200)

      expected = %{"data" => %{"id" => integration.id, "type" => integration.type}}

      assert response == expected
    end
  end

  describe "without logged in user" do
    test "requires user authentication on all actions", %{conn: conn} do
      Enum.each(
        [
          get(conn, Routes.integration_path(conn, :index)),
          get(conn, Routes.integration_path(conn, :show, "1")),
          put(conn, Routes.integration_path(conn, :update, "1", %{}))
        ],
        fn conn ->
          assert json_response(conn, 401)
          assert conn.halted
        end
      )
    end
  end
end
