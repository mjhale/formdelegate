defmodule FormDelegateWeb.StripeHandler do
  @behaviour Stripe.WebhookHandler

  alias FormDelegate.Subscriptions
  alias FormDelegate.Subscriptions.Subscription

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "customer.subscription.created"} = _event) do
    %{object: %Stripe.Subscription{} = stripe_subscription} = data

    {:ok, %Subscription{} = _subscription} =
      Subscriptions.create_subscription(%{
        stripe_subscription_id: stripe_subscription.id,
        stripe_subscription_status: stripe_subscription.status,
        team_id: stripe_subscription.metadata["team_id"]
      })

    :ok
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "invoice.paid"} = _event) do
    %{object: %Stripe.Invoice{} = stripe_invoice} = data

    {:ok, %Stripe.Subscription{} = stripe_subscription} =
      Stripe.Subscription.retrieve(stripe_invoice.subscription)

    %Subscription{} = subscription = Subscriptions.get_subscription!(stripe_subscription.id)

    Subscriptions.update_subscription(subscription, %{
      stripe_subscription_status: stripe_subscription.status,
      ends_at: DateTime.from_unix!(stripe_subscription.current_period_end, :second)
    })

    :ok
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "customer.subscription.deleted"} = _event) do
    %{object: %Stripe.Subscription{} = stripe_subscription} = data
    %Subscription{} = subscription = Subscriptions.get_subscription!(stripe_subscription.id)
    {:ok, %Subscription{} = _subscription} = Subscriptions.delete_subscription(subscription)

    :ok
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "customer.subscription.canceled"} = _event) do
    %{object: %Stripe.Subscription{} = stripe_subscription} = data
    %Subscription{} = subscription = Subscriptions.get_subscription!(stripe_subscription.id)
    {:ok, %Subscription{} = _subscription} = Subscriptions.delete_subscription(subscription)

    :ok
  end

  @impl true
  def handle_event(%Stripe.Event{data: _data, type: "invoice.payment_failed"} = _event) do
    # @TODO: Notify user of failed payment and direct to Stripe portal url

    :ok
  end

  # Return HTTP 200 for unhandled events
  @impl true
  def handle_event(_event) do
    # IO.inspect(event.type)

    :ok
  end
end
