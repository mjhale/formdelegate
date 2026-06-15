defmodule FormDelegateWeb.SubscriptionController do
  use FormDelegateWeb, :controller

  plug FormDelegateWeb.Plugs.LoadCurrentTeam

  alias FormDelegate.Subscriptions
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, _params, current_user) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with :ok <- Authorizer.authorize(:show_user_subscriptions, current_user, current_membership) do
      subscriptions = Subscriptions.list_subscriptions_by_team(current_team)
      render(conn, "index.json", subscriptions: subscriptions)
    end
  end
end
