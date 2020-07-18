defmodule FormDelegateWeb.UserConfirmationControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.Router.Helpers, as: Routes

  setup %{conn: conn, user: user} do
    {:ok, conn: put_req_header(conn, "accept", "application/json"), user: user}
  end

  describe "create/3" do
    @tag :as_inserted_user
    test "Successfully creates a new user confirmation token when provided a valid non-confirmed email and returns the email param",
         %{
           conn: conn,
           user: user
         } do
      req_params = %{user: %{email: user.email}}

      response =
        post(conn, Routes.user_confirmation_path(conn, :create, req_params))
        |> json_response(200)

      expected = %{
        "data" => %{
          "email" => response["data"]["email"]
        }
      }

      assert response == expected
    end

    @tag :as_inserted_user
    test "Returns the email param when trying to reset a password for a nonexistent user",
         %{
           conn: conn,
           user: user
         } do
      {:ok, %User{} = user} = Accounts.confirm_user(user)

      req_params = %{"user" => %{"email" => user.email}}

      response =
        post(conn, Routes.user_confirmation_path(conn, :create, req_params))
        |> json_response(200)

      expected = %{"data" => %{"email" => req_params["user"]["email"]}}

      assert response == expected
    end

    test "Returns the email param when an invalid user email is provided", %{
      conn: conn
    } do
      req_params = %{"user" => %{"email" => "a-nonexistent-user@formdelegate.com"}}

      response =
        post(
          conn,
          Routes.user_confirmation_path(conn, :create, req_params)
        )
        |> json_response(200)

      expected = %{"data" => %{"email" => req_params["user"]["email"]}}

      assert response == expected
    end
  end

  describe "confirm/3" do
    @tag :as_inserted_user
    test "Confirms a user who provides a valid confirmation token", %{conn: conn, user: user} do
      response =
        get(
          conn,
          Routes.user_confirmation_path(conn, :confirm, %{"token" => user.confirmation_token})
        )
        |> json_response(200)

      # Get updated user data
      user = Accounts.get_user!(user.id)

      expected = %{
        "data" => %{
          "email" => user.email
        }
      }

      assert response == expected
    end
  end
end
