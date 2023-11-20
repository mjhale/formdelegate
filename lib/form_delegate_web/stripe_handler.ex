defmodule FormDelegateWeb.StripeHandler do
  @behaviour Stripe.WebhookHandler

  alias FormDelegate.{Plans, Plans.Plan}
  alias FormDelegate.{Subscriptions, Subscriptions.Subscription}

  require Logger

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "customer.subscription.created"} = _event) do
    %{
      object:
        %Stripe.Subscription{
          items: %Stripe.List{
            data: stripe_subscription_items
          }
        } = stripe_subscription
    } = data

    Enum.each(stripe_subscription_items, fn %Stripe.SubscriptionItem{} = subscription_item ->
      %Plan{} = plan = Plans.get_plan_by!(stripe_product_id: subscription_item.plan.product)

      {:ok, %Subscription{} = _subscription} =
        Subscriptions.create_subscription(%{
          stripe_subscription_id: stripe_subscription.id,
          stripe_subscription_status: stripe_subscription.status,
          team_id: stripe_subscription.metadata["team_id"],
          plan_id: plan.id
        })
    end)

    :ok
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "invoice.paid"} = _event) do
    %{object: %Stripe.Invoice{} = stripe_invoice} = data

    {:ok, %Stripe.Subscription{} = stripe_subscription} =
      Stripe.Subscription.retrieve(stripe_invoice.subscription)

    %Subscription{} = subscription = Subscriptions.get_subscription!(stripe_subscription.id)

    {:ok, _subscription} =
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

    # @TODO: Update subscription to canceled instead of deleting, and filter out non-active
    # subscriptions in user and team subscription queries. Only one active subscription
    # per team should be allowed at the moment. Note: canceled subscriptions cannot be restarted.
    {:ok, %Subscription{} = _subscription} = Subscriptions.delete_subscription(subscription)

    :ok
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "customer.subscription.canceled"} = _event) do
    %{object: %Stripe.Subscription{} = stripe_subscription} = data
    %Subscription{} = subscription = Subscriptions.get_subscription!(stripe_subscription.id)

    # @TODO: Update subscription to canceled instead of deleting, and filter out non-active
    # subscriptions in user and team subscription queries. Only one active subscription
    # per team should be allowed at the moment. Note: canceled subscriptions cannot be restarted.
    {:ok, %Subscription{} = _subscription} = Subscriptions.delete_subscription(subscription)

    :ok
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "customer.subscription.updated"} = _event) do
    %{
      object:
        %Stripe.Subscription{
          items: %Stripe.List{
            data: stripe_subscription_items
          }
        } = stripe_subscription
    } = data

    # Assumes a subscription only has one active subscription item
    %Stripe.SubscriptionItem{} =
      stripe_subscription_item =
      stripe_subscription_items
      |> Enum.at(0)

    %Subscription{} = subscription = Subscriptions.get_subscription!(stripe_subscription.id)
    %Plan{} = plan = Plans.get_plan_by!(stripe_product_id: stripe_subscription_item.plan.product)

    {:ok, _updated_subscription} =
      Subscriptions.update_subscription(subscription, %{
        plan_id: plan.id,
        stripe_subscription_status: stripe_subscription.status,
        ends_at: DateTime.from_unix!(stripe_subscription.current_period_end, :second)
      })

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
