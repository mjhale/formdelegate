defmodule FormDelegate.Services.Stripe do
  @callback create_customer(map()) :: {:ok, map()} | {:error, any()}
  @callback delete_customer(String.t()) :: {:ok, map()} | {:error, any()}
  @callback create_checkout_session(map()) :: {:ok, map()} | {:error, any()}
  @callback create_billing_portal_session(map()) :: {:ok, map()} | {:error, any()}
  @callback retrieve_subscription(String.t()) :: {:ok, map()} | {:error, any()}
  @callback update_subscription(String.t(), map()) :: {:ok, map()} | {:error, any()}
end

defmodule FormDelegate.Services.Stripe.Impl do
  @behaviour FormDelegate.Services.Stripe

  @impl true
  def create_customer(params), do: Stripe.Customer.create(params)

  @impl true
  def delete_customer(id), do: Stripe.Customer.delete(id)

  @impl true
  def create_checkout_session(params), do: Stripe.Checkout.Session.create(params)

  @impl true
  def create_billing_portal_session(params), do: Stripe.BillingPortal.Session.create(params)

  @impl true
  def retrieve_subscription(id), do: Stripe.Subscription.retrieve(id)

  @impl true
  def update_subscription(id, params), do: Stripe.Subscription.update(id, params)
end

defmodule FormDelegate.Services.Stripe.Mock do
  @behaviour FormDelegate.Services.Stripe

  @impl true
  def create_customer(_params) do
    {:ok, %Stripe.Customer{id: "cus_mock123"}}
  end

  @impl true
  def delete_customer(_id) do
    {:ok, %{deleted: true}}
  end

  @impl true
  def create_checkout_session(_params) do
    {:ok, %Stripe.Checkout.Session{id: "cs_mock123", url: "https://checkout.stripe.com/mock"}}
  end

  @impl true
  def create_billing_portal_session(_params) do
    {:ok, %Stripe.BillingPortal.Session{url: "https://billing.stripe.com/mock"}}
  end

  @impl true
  def retrieve_subscription(id) do
    {:ok,
     %Stripe.Subscription{
       id: id,
       status: "active",
       current_period_end: DateTime.utc_now() |> DateTime.add(30, :day) |> DateTime.to_unix(),
       items: %Stripe.List{
         data: [
           %Stripe.SubscriptionItem{
             id: "si_mock123",
             price: %Stripe.Price{
               product: "prod_JqNR8AZx7ESoF8I"
             },
             plan: %Stripe.Plan{
               product: "prod_JqNR8AZx7ESoF8I"
             }
           }
         ]
       }
     }}
  end

  @impl true
  def update_subscription(id, _params) do
    {:ok,
     %Stripe.Subscription{
       id: id,
       status: "active",
       current_period_end: DateTime.utc_now() |> DateTime.add(30, :day) |> DateTime.to_unix(),
       items: %Stripe.List{
         data: [
           %Stripe.SubscriptionItem{
             id: "si_mock123",
             price: %Stripe.Price{
               product: "prod_JqNR8AZx7ESoF8I"
             },
             plan: %Stripe.Plan{
               product: "prod_JqNR8AZx7ESoF8I"
             }
           }
         ]
       }
     }}
  end
end
