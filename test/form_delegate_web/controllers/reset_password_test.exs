defmodule FormDelegateWeb.ResetPasswordControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.Router.Helpers, as: Routes

  describe "create/3" do
    @tag :as_inserted_user
    test "Successfully creates a new reset password token when provided a valid non-confirmed email and returns the email param",
         %{
           conn: conn,
           user: user
         } do
      req_params = %{user: %{email: user.email}}

      response =
        post(conn, Routes.reset_password_path(conn, :create, req_params))
        |> json_response(200)

      expected = %{
        "data" => %{
          "email" => response["data"]["email"]
        }
      }

      assert response == expected
    end

    test "Returns the email param when a non-existent user is provided", %{conn: conn} do
      req_params = %{user: %{email: "nonexistent-user@formdelegate.com"}}

      response =
        post(conn, Routes.reset_password_path(conn, :create, req_params))
        |> json_response(200)

      expected = %{
        "data" => %{
          "email" => response["data"]["email"]
        }
      }

      assert response == expected
    end
  end

  describe "update/3" do
    @tag :as_inserted_user
    test "Returns the email param when a user changes a password with a valid password reset token",
         %{
           conn: conn,
           user: user
         } do
      {:ok, %User{} = user} = Accounts.create_reset_password_token(user)

      req_params = %{
        "user" => %{
          "password" => "a new valid password",
          "reset_password_token" => user.reset_password_token
        }
      }

      response =
        put(conn, Routes.reset_password_path(conn, :update, req_params))
        |> json_response(200)

      expected = %{
        "data" => %{
          "email" => response["data"]["email"]
        }
      }

      assert response == expected
    end

    test "Returns an error when a user changes a password with an invalid password reset token",
         %{
           conn: conn
         } do
      req_params = %{
        "user" => %{
          "password" => "a new valid password",
          "reset_password_token" => "an invalid reset password token"
        }
      }

      response =
        put(conn, Routes.reset_password_path(conn, :update, req_params))
        |> json_response(400)

      expected = %{
        "errors" => %{"detail" => "BAD_REQUEST"},
        "message" => "INVALID_OR_EXPIRED_CONFIRMATION_TOKEN"
      }

      assert response == expected
    end
  end
end
