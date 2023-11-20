defmodule FormDelegateWeb.SubscriptionController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Subscriptions
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, _params, current_user) do
    with :ok <- Authorizer.authorize(:show_user_subscriptions, current_user) do
      subscriptions = Subscriptions.list_subscriptions_by_user(current_user)
      render(conn, "index.json", subscriptions: subscriptions)
    end
  end
end
