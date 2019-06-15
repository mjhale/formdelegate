defmodule FormDelegateWeb.UserControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

  @valid_attrs %{email: "user@formdelegate.com", name: "Form User", password: "Qcd%dW38eR#xyL3v"}
  @update_attrs %{
    email: "updateduser@formdelegate.com",
    name: "Updated Form User",
    password: "@1MTe*znr6dJ6gP"
  }
  @invalid_attrs %{email: nil, name: nil, password: nil}

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

  describe "index/3" do
    @tag :as_inserted_admin
    test "Responds with all users as admin user", %{conn: conn, user: user, jwt: jwt} do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :index))
        |> json_response(200)

      expected = %{
        "data" => [
          %{
            "id" => user.id,
            "email" => user.email,
            "name" => user.name,
            "form_count" => user.form_count,
            "verified" => user.verified,
            "is_admin" => user.is_admin
          }
        ]
      }

      assert response == expected
    end

    @tag :as_inserted_user
    test "Returns an error and does not list all users as non-admin user", %{conn: conn, jwt: jwt} do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :index))
        |> json_response(403)

      expected = %{"errors" => %{"detail" => "Forbidden"}}

      assert response == expected
    end
  end

  describe "create/3" do
    test "Creates, and responds with a newly created user if attributes are valid", %{conn: conn} do
      response =
        conn
        |> post(Routes.user_path(conn, :create), user: @valid_attrs)
        |> json_response(201)

      expected = %{
        "data" => %{
          "id" => response["data"]["id"],
          "email" => "user@formdelegate.com",
          "name" => "Form User",
          "form_count" => 0,
          "verified" => false,
          "is_admin" => false
        }
      }

      assert response == expected
    end

    test "Returns an error and does not create a user if attributes are invalid", %{conn: conn} do
      response =
        conn
        |> post(Routes.user_path(conn, :create), user: @invalid_attrs)
        |> json_response(422)

      expected = %{"errors" => %{"email" => ["can't be blank"]}}

      assert response == expected
    end
  end

  describe "update/3" do
    @tag :as_inserted_user
    test "Edits, and responds with the user if attributes are valid", %{
      conn: conn,
      jwt: jwt,
      user: user
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.user_path(conn, :update, user), user: @update_attrs)
        |> json_response(200)

      expected = %{
        "data" => %{
          "id" => response["data"]["id"],
          "email" => "updateduser@formdelegate.com",
          "name" => "Updated Form User",
          "form_count" => 0,
          "verified" => false,
          "is_admin" => false
        }
      }

      assert response == expected
    end

    @tag :as_inserted_user
    test "Returns an error and does not edit the user if attributes are invalid", %{
      conn: conn,
      jwt: jwt,
      user: user
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.user_path(conn, :update, user), user: @invalid_attrs)
        |> json_response(422)

      expected = %{"errors" => %{"email" => ["can't be blank"]}}

      assert response == expected

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :show, user.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "id" => user.id,
          "email" => user.email,
          "name" => user.name,
          "form_count" => user.form_count,
          "verified" => user.verified,
          "is_admin" => user.is_admin
        }
      }

      assert response == expected
    end
  end

  describe "show/3" do
    @tag :as_inserted_user
    test "Responds with user info if the user is found", %{conn: conn, jwt: jwt, user: user} do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :show, user.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "id" => user.id,
          "email" => user.email,
          "name" => user.name,
          "form_count" => user.form_count,
          "verified" => user.verified,
          "is_admin" => user.is_admin
        }
      }

      assert response == expected
    end

    @tag :as_inserted_user
    test "Responds with a message indicating user not found", %{conn: conn, jwt: jwt} do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :show, -1))
        |> json_response(404)

      expected = %{"errors" => %{"detail" => "Page not found"}}

      assert response == expected
    end
  end

  @tag :as_inserted_user
  test "delete/3 and responds with :ok if the user was deleted", %{
    conn: conn,
    jwt: jwt,
    user: user
  } do
    conn
    |> put_req_header("authorization", "bearer: " <> jwt)
    |> delete(Routes.user_path(conn, :delete, user.id))
    |> response(204)

    assert_error_sent 404, fn ->
      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> get(Routes.user_path(conn, :show, user.id))
    end
  end
end
