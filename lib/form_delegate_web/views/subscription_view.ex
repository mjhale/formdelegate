defmodule FormDelegateWeb.SubscriptionView do
  use FormDelegateWeb, :view

  def render("subscription.json", %{subscription: subscription}) do
    %{
      id: subscription.id,
      stripe_subscription_status: subscription.stripe_subscription_status,
      stripe_subscription_id: subscription.stripe_subscription_id,
      ends_at: subscription.ends_at
    }
  end
end
