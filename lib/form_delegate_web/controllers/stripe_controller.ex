defmodule FormDelegateWeb.StripeController do
  use FormDelegateWeb, :controller

  require Logger
  require IEx
  require Protocol

  alias FormDelegate.Accounts
  alias FormDelegate.Accounts.User
  alias FormDelegate.Subscriptions
  alias FormDelegate.Subscriptions.Subscription
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  @frontend_url Application.get_env(:form_delegate, :frontend_url)

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  Protocol.derive(Jason.Encoder, Stripe.Checkout.Session)
  Protocol.derive(Jason.Encoder, Stripe.List)
  Protocol.derive(Jason.Encoder, Stripe.Subscription)
  Protocol.derive(Jason.Encoder, Stripe.SubscriptionItem)
  Protocol.derive(Jason.Encoder, Stripe.Plan)
  Protocol.derive(Jason.Encoder, Stripe.Price)

  def create_checkout_session(
        conn,
        %{
          "priceId" => price_id
        },
        current_user
      ) do
    {:ok, stripe_customer_id} = get_stripe_customer_id_for_user(current_user)

    stripe_session =
      Stripe.Checkout.Session.create(%{
        payment_method_types: [:card],
        mode: :subscription,
        customer: stripe_customer_id,
        line_items: [
          %{
            price: price_id,
            quantity: 1
          }
        ],
        success_url:
          "#{@frontend_url}/account/subscriptions/confirmed?stripe_session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "#{@frontend_url}/account/subscriptions/abandoned",
        subscription_data: %{
          items: [],
          metadata: %{
            "team_id" => current_user.team_id
          }
        }
      })

    case stripe_session do
      {:ok, %Stripe.Checkout.Session{} = session} ->
        json(conn, session)

      {:error, error} ->
        Logger.error("Stripe checkout session error: #{inspect(error)}", %{
          stripe: %{session_create: stripe_session}
        })

        {:error, :bad_request}
    end
  end

  def retrieve_subscription(conn, %{"id" => stripe_subscription_id}, current_user) do
    with %Subscription{} = subscription <-
           Subscriptions.get_subscription!(stripe_subscription_id),
         :ok <-
           Authorizer.authorize(:retrieve_subscription, current_user, subscription) do
      stripe_subscription = Stripe.Subscription.retrieve(stripe_subscription_id)

      case stripe_subscription do
        {:ok, %Stripe.Subscription{} = subscription} ->
          json(conn, subscription)

        {:error, error} ->
          Logger.error("Stripe retrieve subscription error: #{inspect(error)}", %{
            stripe: %{subscription_retrieve: stripe_subscription}
          })

          {:error, :bad_request}
      end
    end
  end

  def update_subscription_price(
        conn,
        %{"id" => stripe_subscription_id, "subscription" => %{"price_id" => stripe_price_id}},
        current_user
      ) do
    with %Subscription{} = subscription <-
           Subscriptions.get_subscription!(stripe_subscription_id),
         :ok <-
           Authorizer.authorize(:update_stripe_subscription, current_user, subscription) do
      {:ok,
       %Stripe.Subscription{
         items: %Stripe.List{
           data: stripe_subscription_items
         }
       } = stripe_subscription} = Stripe.Subscription.retrieve(stripe_subscription_id)

      # Assumes a subscription only has one active subscription item
      %Stripe.SubscriptionItem{} =
        stripe_subscription_item =
        stripe_subscription_items
        |> Enum.at(0)

      updated_subscription =
        Stripe.Subscription.update(stripe_subscription_id, %{
          "items" => [%{"id" => stripe_subscription_item.id, "price" => stripe_price_id}]
        })

      case updated_subscription do
        {:ok, %Stripe.Subscription{} = subscription} ->
          json(conn, Map.from_struct(subscription))

        {:error, error} ->
          Logger.error("Stripe retrieve subscription error: #{inspect(error)}", %{
            stripe: %{subscription_update: updated_subscription}
          })

          {:error, :bad_request}
      end
    end
  end

  def create_portal(conn, _params, current_user) do
    {:ok, %{url: portal_url}} =
      Stripe.BillingPortal.Session.create(%{
        customer: current_user.stripe_customer_id,
        return_url: "#{@frontend_url}/account/billing"
      })

    json(conn, %{url: portal_url})
  end

  defp get_stripe_customer_id_for_user(%User{} = user) do
    # Create a Stripe customer for the user if it doesn't exist
    if is_nil(user.stripe_customer_id) do
      case Stripe.Customer.create(%{name: user.name, email: user.email}) do
        {:ok, stripe_customer} ->
          {:ok, _user} = Accounts.update_user(user, %{stripe_customer_id: stripe_customer.id})
          {:ok, stripe_customer.id}

        {error, stripe_customer} ->
          Logger.error("Failed to create Stripe customer for user #{user.id}: #{inspect(error)}")
          {:ok, _response} = Stripe.Customer.delete(stripe_customer["id"])
          {:error, :stripe_customer_create_failed}
      end
    else
      {:ok, user.stripe_customer_id}
    end
  end
end
