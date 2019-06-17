defmodule FormDelegateWeb.SessionController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.Guardian

  action_fallback FormDelegateWeb.FallbackController

  def create(conn, %{"session" => %{"email" => email, "password" => password}}) do
    case Accounts.authenticate_user(%{email: email, password: password}) do
      {:ok, %User{} = user} ->
        {:ok, token, _claims} = Guardian.encode_and_sign(user, %{}, token_type: "access")
        render(conn, "show.json", %{session: %{token: token}})

      {:error, _reason} ->
        body = Jason.encode!(%{message: "Bad credentials"})

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(:unauthorized, body)
    end
  end
end
