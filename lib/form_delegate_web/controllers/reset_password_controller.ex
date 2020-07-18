defmodule FormDelegateWeb.ResetPasswordController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.Mailers

  action_fallback FormDelegateWeb.FallbackController

  require Logger

  def create(conn, %{"user" => %{"email" => email}}) do
    with %User{} = user <- Accounts.get_user_by_email(email),
         {:ok, %User{} = user} <- Accounts.create_reset_password_token(user) do
      Mailers.ResetPasswordRequestMailer.send_reset_password_request_email(user)
    else
      nil ->
        Logger.info("FD Create Reset Password: Unable to find user #{email}")

      {:error, %Ecto.Changeset{} = changeset} ->
        Logger.info(
          "FD Create Reset Password: Unable to create new token for user #{email}: #{
            inspect(changeset, pretty: true)
          }"
        )
    end

    render(conn, :show, %{user: %{email: email}})
  end

  def update(conn, %{
        "user" => %{"password" => password, "reset_password_token" => reset_password_token}
      }) do
    with %User{} = user <- Accounts.get_user_by_reset_password_token!(reset_password_token),
         {:ok, %User{} = user} <- Accounts.reset_user_password(user, %{"password" => password}) do
      render(conn, "show.json", user: user)
    end
  end
end
