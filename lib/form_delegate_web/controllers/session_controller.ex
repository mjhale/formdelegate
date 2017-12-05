defmodule FormDelegateWeb.SessionController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Accounts.User
  alias FormDelegateWeb.Guardian
  alias FormDelegateWeb.Session

  action_fallback FormDelegateWeb.FallbackController
  def create(conn, %{"user" => %{"email" => email,
                                 "password" => password}}) do
    with {:ok, %User{} = user} <- Session.authenticate(%{email: email, password: password}),
         {:ok, token, _claims} = Guardian.encode_and_sign(user, %{}, token_type: "access") do

      conn
      |> render("show.json", %{session: %{token: token}})
    end
  end

  def delete(conn, _params) do
    conn
    |> Guardian.Plug.sign_out
    |> put_resp_header("content-type", "application/json")
    |> send_resp(:no_content, "")
  end
end
