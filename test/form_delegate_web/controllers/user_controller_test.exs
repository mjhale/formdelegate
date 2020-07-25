defmodule FormDelegateWeb.UserControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

  @valid_attrs %{
    captcha: "10000000-aaaa-bbbb-cccc-000000000001",
    user: %{
      email: "user@formdelegate.com",
      name: "Form User",
      password: "Qcd%dW38eR#xyL3v"
    }
  }
  @update_attrs %{
    email: "updateduser@formdelegate.com",
    name: "Updated Form User",
    password: "@1MTe*znr6dJ6gP"
  }
  @invalid_attrs %{
    captcha: "10000000-aaaa-bbbb-cccc-000000000001",
    user: %{
      email: nil,
      name: nil,
      password: nil
    }
  }
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
            "confirmed_at" => nil,
            "email" => user.email,
            "form_count" => user.form_count,
            "id" => user.id,
            "is_admin" => user.is_admin,
            "name" => user.name
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

      expected = %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}

      assert response == expected
    end
  end

  describe "create/3" do
    test "Creates, and responds with a newly created session token if attributes are valid", %{
      conn: conn
    } do
      response =
        conn
        |> post(Routes.user_path(conn, :create), @valid_attrs)
        |> json_response(201)

      expected = %{
        "data" => %{
          "email" => "user@formdelegate.com",
          "id" => response["data"]["id"],
          "token" => response["data"]["token"]
        }
      }

      assert response == expected
    end

    test "Returns an error and does not create a user if attributes are invalid", %{conn: conn} do
      response =
        conn
        |> post(Routes.user_path(conn, :create), @invalid_attrs)
        |> json_response(422)

      expected = %{
        "error" => %{
          "code" => 422,
          "errors" => %{
            "user" => %{
              "email" => ["can't be blank"],
              "name" => ["can't be blank"],
              "password" => ["can't be blank"]
            }
          },
          "type" => "UNPROCESSABLE_ENTITY"
        }
      }

      assert response == expected
    end

    @tag :as_inserted_user
    test "Returns an error and does not create a user if already authenticated", %{
      conn: conn,
      jwt: jwt
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.user_path(conn, :create), @valid_attrs)
        |> json_response(403)

      expected = %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}

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
          "confirmed_at" => nil,
          "email" => "updateduser@formdelegate.com",
          "form_count" => 0,
          "id" => response["data"]["id"],
          "is_admin" => false,
          "name" => "Updated Form User"
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
      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> put(Routes.user_path(conn, :update, user), @invalid_attrs)
      |> json_response(:unprocessable_entity)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :show, user.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "confirmed_at" => nil,
          "email" => user.email,
          "form_count" => user.form_count,
          "id" => user.id,
          "is_admin" => user.is_admin,
          "name" => user.name
        }
      }

      assert response == expected
    end

    test "Returns an error and does not edit the user if editing other user", %{conn: conn} do
      user = FormDelegate.Factory.insert(:user)
      {:ok, user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(user)

      other_user = FormDelegate.Factory.insert(:user)
      {:ok, other_user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(other_user)

      conn
      |> put_req_header("authorization", "bearer: " <> user_jwt)
      |> put(Routes.user_path(conn, :update, other_user), @valid_attrs)
      |> json_response(403)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> other_user_jwt)
        |> get(Routes.user_path(conn, :show, other_user))
        |> json_response(200)

      expected = %{
        "data" => %{
          "confirmed_at" => nil,
          "email" => other_user.email,
          "form_count" => other_user.form_count,
          "id" => other_user.id,
          "is_admin" => other_user.is_admin,
          "name" => other_user.name
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
          "confirmed_at" => nil,
          "email" => user.email,
          "form_count" => user.form_count,
          "id" => user.id,
          "is_admin" => user.is_admin,
          "name" => user.name
        }
      }

      assert response == expected
    end

    @tag :as_inserted_user
    test "Responds with an error indicating user not found", %{conn: conn, jwt: jwt} do
      assert_error_sent :not_found, fn ->
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :show, -1))
      end
    end

    test "Returns an error and does not show another user's info", %{
      conn: conn
    } do
      user = FormDelegate.Factory.insert(:user)

      other_user = FormDelegate.Factory.insert(:user)
      {:ok, other_user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(other_user)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> other_user_jwt)
        |> get(Routes.user_path(conn, :show, user.id))
        |> json_response(403)

      expected = %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}

      assert response == expected
    end
  end

  describe "delete/3" do
    @tag :as_inserted_user
    test "Deletes, and returns a 404 if the user was deleted", %{
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

    test "Returns an error and does not delete another user", %{
      conn: conn
    } do
      user = FormDelegate.Factory.insert(:user)
      {:ok, jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(user)

      other_user = FormDelegate.Factory.insert(:user)
      {:ok, other_user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(other_user)

      conn
      |> put_req_header("authorization", "bearer: " <> other_user_jwt)
      |> delete(Routes.user_path(conn, :delete, user.id))
      |> json_response(403)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :show, user))
        |> json_response(200)

      expected = %{
        "data" => %{
          "confirmed_at" => nil,
          "email" => user.email,
          "form_count" => user.form_count,
          "id" => user.id,
          "is_admin" => user.is_admin,
          "name" => user.name
        }
      }

      assert response == expected
    end
  end

  describe "without logged in user" do
    test "requires user authentication on all actions except create/2", %{conn: conn} do
      Enum.each(
        [
          get(conn, Routes.user_path(conn, :index)),
          get(conn, Routes.user_path(conn, :show, "1")),
          put(conn, Routes.user_path(conn, :update, "1", %{})),
          delete(conn, Routes.user_path(conn, :delete, "1"))
        ],
        fn conn ->
          assert json_response(conn, 401)
          assert conn.halted
        end
      )
    end
  end
end
