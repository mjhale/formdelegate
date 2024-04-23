defmodule FormDelegateWeb.UserConfirmationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegate.Jobs.UserConfirmationEmail

  require Logger

  action_fallback FormDelegateWeb.FallbackController

  def create(conn, %{"user" => %{"email" => email}}) do
    if user = Accounts.get_user_by_email(email) do
      # @TODO: Prevent multiple reset confirmation attempts in a short period
      with {:ok, %User{} = user} <- Accounts.reset_user_confirmation(user) do
        %{user_id: user.id}
        |> UserConfirmationEmail.new()
        |> Oban.insert()
      else
        {:error, %Ecto.Changeset{} = changeset} ->
          Logger.error("FD User Confirmation Token: Unable to create token for #{email}")
          Logger.error(inspect(changeset, pretty: true))
      end
    end

    # Show same response regardless of outcome
    render(conn, :show, %{user: %{email: email}})
  end

  def confirm(conn, %{"token" => token}) do
    with %User{} = user <- Accounts.get_user_by_confirmation_token!(token),
         {:ok, %User{} = user} <- Accounts.confirm_user(user) do
      render(conn, :show, user: user)
    end
  end
end
