defmodule FormDelegateWeb.StripeController do
  use FormDelegateWeb, :controller

  require Logger

  alias FormDelegate.Accounts
  alias FormDelegate.Accounts.User

  action_fallback FormDelegateWeb.FallbackController

  @frontend_url Application.get_env(:form_delegate, :frontend_url)

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def create_checkout_session(
        conn,
        %{
          "priceId" => price_id
        },
        current_user
      ) do
    {:ok, stripe_customer_id} = get_stripe_customer_id_for_user(current_user)

    stripe_session =
      Stripe.Session.create(%{
        payment_method_types: ["card"],
        mode: "subscription",
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
          metadata: %{"team_id" => current_user.team_id}
        }
      })

    case stripe_session do
      {:ok, session} ->
        json(conn, Map.from_struct(session))

      {:error, error} ->
        Logger.error("Stripe checkout session error: #{inspect(error)}", %{
          stripe: %{session_create: stripe_session}
        })

        {:error, :bad_request}
    end
  end

  def create_portal(conn, _params, current_user) do
    {:ok, %{url: portal_url}} =
      Stripe.BillingPortal.Session.create(%{
        customer: current_user.stripe_customer_id,
        return_url: "#{@frontend_url}/account/subscriptions/portal_return"
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
