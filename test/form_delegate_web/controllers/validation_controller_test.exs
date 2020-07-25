defmodule FormDelegateWeb.ValidationControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

  describe "email/3" do
    test "returns 'is_valid' value of true when given unique email address", %{conn: conn} do
      response =
        conn
        |> post(Routes.email_validation_path(conn, :email), email: "a-unique-email@company.com")
        |> json_response(200)

      expected = %{
        "data" => %{
          "email" => "a-unique-email@company.com",
          "is_valid" => true
        }
      }

      assert response == expected
    end

    test "returns 'is_valid' value of false when given existing email address", %{conn: conn} do
      user = FormDelegate.Factory.insert(:user)

      response =
        conn
        |> post(Routes.email_validation_path(conn, :email), email: user.email)
        |> json_response(200)

      expected = %{
        "data" => %{
          "email" => user.email,
          "is_valid" => false
        }
      }

      assert response == expected
    end
  end
end
