defmodule FormDelegateWeb.UserConfirmationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.Mailers

  action_fallback FormDelegateWeb.FallbackController

  def create(conn, %{"user" => %{"email" => email}}) do
    if user = Accounts.get_user_by_email(email) do
      # @TODO: Prevent multiple reset confirmation attempts in a short period
      Accounts.reset_user_confirmation(user)
      Mailers.UserConfirmation.send_user_confirmation_email(user)
    end

    # Show same response regardless of outcome
    render(conn, :show, %{user: %{email: email}})
  end

  def confirm(conn, %{"token" => token}) do
    case Accounts.confirm_user(token) do
      {:ok, %User{} = user} ->
        render(conn, :show, user: user)

      _ ->
        {:error, :bad_request, %{message: "INVALID_OR_EXPIRED_CONFIRMATION_TOKEN"}}
    end
  end
end
