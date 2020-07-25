defmodule FormDelegateWeb.ValidationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Accounts
  alias FormDelegate.Accounts.User

  action_fallback FormDelegateWeb.FallbackController

  def action(conn, _opts) do
    args = [conn, conn.params, conn.assigns[:current_user] || :guest]
    apply(__MODULE__, action_name(conn), args)
  end

  # @TODO: Add basic email address validator (e.g., contains '@')
  # @TODO: Add rate limiting?
  def email(conn, %{"email" => email}, _current_user) do
    # Check if email address is already associated with a user
    with %User{} <- Accounts.get_user_by_email(email) do
      conn
      |> assign(:email, email)
      |> assign(:is_valid, false)
      |> render(:email)
    else
      nil ->
        conn
        |> assign(:email, email)
        |> assign(:is_valid, true)
        |> render(:email)
    end
  end
end
