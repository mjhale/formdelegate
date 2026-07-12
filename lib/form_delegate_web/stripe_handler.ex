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
            data: _stripe_subscription_items
          }
        } = stripe_subscription
    } = data

    {:ok, %Subscription{} = _subscription} = upsert_subscription(stripe_subscription)

    :ok
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "invoice.paid"} = _event) do
    %{object: %Stripe.Invoice{} = stripe_invoice} = data

    {:ok, %Stripe.Subscription{} = stripe_subscription} =
      stripe_api().retrieve_subscription(stripe_invoice.subscription)

    {:ok, %Subscription{} = _subscription} = upsert_subscription(stripe_subscription)

    :ok
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "customer.subscription.deleted"} = _event) do
    %{object: %Stripe.Subscription{} = stripe_subscription} = data

    deactivate_subscription(stripe_subscription, "canceled")
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "customer.subscription.canceled"} = _event) do
    %{object: %Stripe.Subscription{} = stripe_subscription} = data

    deactivate_subscription(stripe_subscription, "canceled")
  end

  @impl true
  def handle_event(%Stripe.Event{data: data, type: "customer.subscription.updated"} = _event) do
    %{
      object:
        %Stripe.Subscription{
          items: %Stripe.List{
            data: _stripe_subscription_items
          }
        } = stripe_subscription
    } = data

    {:ok, %Subscription{} = _subscription} = upsert_subscription(stripe_subscription)

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

  defp stripe_api do
    Application.get_env(:form_delegate, :stripe_api)
  end

  defp deactivate_subscription(%Stripe.Subscription{} = stripe_subscription, fallback_status) do
    case Subscriptions.get_subscription(stripe_subscription.id) do
      nil ->
        :ok

      %Subscription{} = subscription ->
        attrs =
          %{stripe_subscription_status: stripe_subscription.status || fallback_status}
          |> maybe_put_ends_at(stripe_subscription.current_period_end)

        {:ok, %Subscription{} = _subscription} =
          Subscriptions.update_subscription(subscription, attrs)

        :ok
    end
  end

  defp upsert_subscription(%Stripe.Subscription{} = stripe_subscription) do
    # Assumes a subscription only has one active subscription item.
    %Stripe.SubscriptionItem{} = subscription_item = Enum.at(stripe_subscription.items.data, 0)
    %Plan{} = plan = resolve_plan!(subscription_item)

    attrs =
      %{
        stripe_subscription_id: stripe_subscription.id,
        stripe_subscription_status: stripe_subscription.status,
        team_id: stripe_subscription.metadata["team_id"],
        plan_id: plan.id
      }
      |> maybe_put_ends_at(stripe_subscription.current_period_end)

    case Subscriptions.get_subscription(stripe_subscription.id) do
      nil ->
        Subscriptions.create_subscription(attrs)

      %Subscription{} = subscription ->
        attrs
        |> Map.drop([:stripe_subscription_id, :team_id])
        |> then(&Subscriptions.update_subscription(subscription, &1))
    end
  end

  defp maybe_put_ends_at(attrs, current_period_end) when is_integer(current_period_end) do
    Map.put(attrs, :ends_at, DateTime.from_unix!(current_period_end, :second))
  end

  defp maybe_put_ends_at(attrs, _current_period_end), do: attrs

  defp resolve_plan!(%Stripe.SubscriptionItem{} = subscription_item) do
    plan =
      (stripe_price_id(subscription_item) &&
         Plans.get_plan_by(stripe_price_id: stripe_price_id(subscription_item))) ||
        (stripe_product_id(subscription_item) &&
           Plans.get_plan_by(stripe_product_id: stripe_product_id(subscription_item)))

    case plan do
      %Plan{} = plan ->
        plan

      nil ->
        raise "Unable to resolve local plan for Stripe subscription item #{inspect(subscription_item)}"
    end
  end

  defp stripe_price_id(%Stripe.SubscriptionItem{price: %Stripe.Price{id: id}}), do: id
  defp stripe_price_id(_subscription_item), do: nil

  defp stripe_product_id(%Stripe.SubscriptionItem{price: %Stripe.Price{product: product}})
       when is_binary(product),
       do: product

  defp stripe_product_id(%Stripe.SubscriptionItem{plan: %Stripe.Plan{product: product}})
       when is_binary(product),
       do: product

  defp stripe_product_id(_subscription_item), do: nil
end
