defmodule FormDelegateWeb.ResetPasswordController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.Mailers

  action_fallback FormDelegateWeb.FallbackController

  def create(conn, %{"user" => %{"email" => email}}) do
    if user = Accounts.get_user_by_email(email) do
      Accounts.create_reset_password_token(user)
      Mailers.ResetPassword.send_reset_password_email(user)
    end

    render(conn, :show, %{user: %{email: email}})
  end

  def update(conn, %{
        "user" => %{"password" => password, "reset_password_token" => reset_password_token}
      }) do
    with %User{} = user <- Accounts.get_user_by_reset_password_token(reset_password_token),
         {:ok, _} <- Accounts.reset_user_password(user, %{"password" => password}) do
      render(conn, "show.json", user: user)
    else
      _ ->
        {:error, :bad_request, %{message: "INVALID_OR_EXPIRED_CONFIRMATION_TOKEN"}}
    end
  end
end
