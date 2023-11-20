defmodule FormDelegateWeb.SubscriptionView do
  use FormDelegateWeb, :view

  alias FormDelegateWeb.PlanView
  alias FormDelegateWeb.SubscriptionView

  def render("index.json", %{subscriptions: subscriptions}) do
    %{data: render_many(subscriptions, SubscriptionView, "subscription.json")}
  end

  def render("subscription.json", %{subscription: subscription}) do
    %{
      id: subscription.id,
      stripe_subscription_status: subscription.stripe_subscription_status,
      stripe_subscription_id: subscription.stripe_subscription_id,
      plan: render_one(subscription.plan, PlanView, "plan.json"),
      ends_at: subscription.ends_at
    }
  end
end
