defmodule FormDelegateWeb.UserControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.Accounts
  alias FormDelegateWeb.Router.Helpers, as: Routes

  @current_password "a sufficiently long password"
  @new_password "a different valid password!"
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
  @valid_password_attrs %{
    "current_password" => @current_password,
    "password" => @new_password,
    "password_confirmation" => @new_password
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

  describe "change_password/3" do
    @tag :as_inserted_user
    test "Updates the user password with the snake case account payload and returns a fresh token",
         %{
           conn: conn,
           jwt: jwt,
           user: user
         } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.user_change_password_path(conn, :change_password, user.id),
          user: @valid_password_attrs
        )
        |> json_response(200)

      assert %{"data" => %{"token" => new_jwt}} = response

      assert {:ok, %{id: user_id}} =
               Accounts.authenticate_user(%{email: user.email, password: @new_password})

      assert user_id == user.id

      assert {:error, :invalid_credentials} =
               Accounts.authenticate_user(%{email: user.email, password: @current_password})

      assert {:error, :stale_auth_token} = FormDelegateWeb.Guardian.decode_and_verify(jwt)
      assert {:ok, _claims} = FormDelegateWeb.Guardian.decode_and_verify(new_jwt)

      stale_response =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :show, user.id))
        |> json_response(401)

      assert %{"type" => "invalid_token"} = stale_response

      fresh_response =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", "bearer: " <> new_jwt)
        |> get(Routes.user_path(conn, :show, user.id))
        |> json_response(200)

      assert %{"data" => actual_user} = fresh_response
      assert_profile_fields(actual_user, Accounts.get_user!(user.id))
    end

    @tag :as_inserted_user
    test "Returns an error when current password is invalid", %{
      conn: conn,
      jwt: jwt,
      user: user
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.user_change_password_path(conn, :change_password, user.id),
          user: Map.put(@valid_password_attrs, "current_password", "wrong current password")
        )
        |> json_response(422)

      assert %{"error" => %{"errors" => %{"current_password" => ["is invalid"]}}} = response
    end

    @tag :as_inserted_user
    test "Returns an error when password confirmation does not match", %{
      conn: conn,
      jwt: jwt,
      user: user
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.user_change_password_path(conn, :change_password, user.id),
          user: Map.put(@valid_password_attrs, "password_confirmation", "not the same password")
        )
        |> json_response(422)

      assert %{"error" => %{"errors" => %{"password_confirmation" => errors}}} = response
      assert "does not match confirmation" in errors
    end

    @tag :as_inserted_user
    test "Returns an error when password is too weak", %{
      conn: conn,
      jwt: jwt,
      user: user
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.user_change_password_path(conn, :change_password, user.id),
          user:
            Map.merge(@valid_password_attrs, %{
              "password" => "short",
              "password_confirmation" => "short"
            })
        )
        |> json_response(422)

      assert %{"error" => %{"errors" => %{"password" => errors}}} = response
      assert "should be at least 8 character(s)" in errors
    end

    test "Returns an error when changing another user's password", %{conn: conn} do
      target_user =
        build(:user)
        |> set_password(@current_password)
        |> insert()

      other_user =
        build(:user)
        |> set_password(@current_password)
        |> insert()

      {:ok, jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(other_user)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.user_change_password_path(conn, :change_password, target_user.id),
          user: @valid_password_attrs
        )
        |> json_response(403)

      expected = %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}

      assert response == expected

      assert {:ok, %{id: target_user_id}} =
               Accounts.authenticate_user(%{
                 email: target_user.email,
                 password: @current_password
               })

      assert target_user_id == target_user.id
    end
  end

  describe "index/3" do
    @tag :as_inserted_admin
    test "Responds with all users as admin user", %{conn: conn, user: user, jwt: jwt} do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :index))
        |> json_response(200)

      assert %{"data" => [actual_user]} = response
      assert_user_fields(actual_user, user)
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

      assert %{"data" => actual_user} = response

      assert_profile_fields(actual_user, %{
        user
        | email: "updateduser@formdelegate.com",
          name: "Updated Form User"
      })
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

      assert %{"data" => actual_user} = response
      assert_profile_fields(actual_user, user)
    end

    test "Returns an error and does not edit the user if editing other user", %{conn: conn} do
      {user, _team, _membership} = FormDelegate.Factory.insert_user_with_membership()
      {:ok, user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(user)

      {other_user, _other_team, _other_membership} =
        FormDelegate.Factory.insert_user_with_membership()

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

      assert %{"data" => actual_user} = response
      assert_profile_fields(actual_user, other_user)
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

      assert %{"data" => actual_user} = response
      assert_profile_fields(actual_user, user)
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
      {user, _team, _membership} = FormDelegate.Factory.insert_user_with_membership()

      {other_user, _other_team, _other_membership} =
        FormDelegate.Factory.insert_user_with_membership()

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
    test "Deletes, and rejects the deleted user's token", %{
      conn: conn,
      jwt: jwt,
      user: user
    } do
      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> delete(Routes.user_path(conn, :delete, user.id))
      |> response(204)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.user_path(conn, :show, user.id))
        |> json_response(401)

      assert %{"type" => "invalid_token"} = response
    end

    test "Returns an error and does not delete another user", %{
      conn: conn
    } do
      {user, _team, _membership} = FormDelegate.Factory.insert_user_with_membership()
      {:ok, jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(user)

      {other_user, _other_team, _other_membership} =
        FormDelegate.Factory.insert_user_with_membership()

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

      assert %{"data" => actual_user} = response
      assert_profile_fields(actual_user, user)
    end
  end

  describe "without logged in user" do
    test "requires user authentication on all actions except create/2", %{conn: conn} do
      Enum.each(
        [
          get(conn, Routes.user_path(conn, :index)),
          get(conn, Routes.user_path(conn, :show, "1")),
          post(conn, Routes.user_change_password_path(conn, :change_password, "1"),
            user: @valid_password_attrs
          ),
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

  defp assert_user_fields(actual, expected_user) do
    assert actual["id"] == expected_user.id
    assert actual["email"] == expected_user.email
    assert actual["name"] == expected_user.name
    assert actual["is_admin"] == expected_user.is_admin
    assert actual["form_count"] == expected_user.form_count

    assert actual["confirmed_at"] ==
             (expected_user.confirmed_at && DateTime.to_iso8601(expected_user.confirmed_at))

    refute Map.has_key?(actual, "team")
    refute Map.has_key?(actual, "membership")
    refute Map.has_key?(actual, "is_billing_account")
    refute Map.has_key?(actual, "stripe_customer_id")
  end

  defp assert_profile_fields(actual, expected_user) do
    assert_user_fields(actual["user"], expected_user)

    assert %{"id" => _team_id, "stripe_customer_id" => _stripe_customer_id} =
             actual["current_team"]

    assert %{
             "id" => _membership_id,
             "is_billing_account" => _is_billing_account,
             "team" => %{"id" => _membership_team_id}
           } = actual["current_membership"]

    assert [
             %{
               "id" => _membership_id,
               "is_billing_account" => _membership_is_billing_account,
               "team" => %{"id" => _team_id}
             }
             | _
           ] = actual["memberships"]
  end
end
