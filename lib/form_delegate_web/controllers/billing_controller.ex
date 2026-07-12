defmodule FormDelegateWeb.BillingController do
  use FormDelegateWeb, :controller

  plug FormDelegateWeb.Plugs.LoadCurrentTeam

  alias FormDelegate.BillingCounts
  alias FormDelegate.Plans
  alias FormDelegate.Plans.Plan
  alias FormDelegate.Subscriptions
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def usage(conn, _params, current_user) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with :ok <- Authorizer.authorize(:show_billing_usage, current_user, current_membership) do
      subscription = Subscriptions.get_active_subscription_for_team(current_team)
      plan = plan_for_subscription(subscription)
      usage = BillingCounts.usage_summary(current_team, plan, subscription)

      render(conn, "usage.json", usage: usage)
    end
  end

  defp plan_for_subscription(%{plan: %Plan{} = plan}), do: plan
  defp plan_for_subscription(_subscription), do: Plans.get_free_plan()
end
