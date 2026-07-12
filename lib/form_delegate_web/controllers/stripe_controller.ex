defmodule FormDelegateWeb.StripeController do
  use FormDelegateWeb, :controller

  plug FormDelegateWeb.Plugs.LoadCurrentTeam

  require Logger
  require IEx
  require Protocol

  alias FormDelegate.Accounts.User
  alias FormDelegate.Plans
  alias FormDelegate.Plans.Plan
  alias FormDelegate.Subscriptions
  alias FormDelegate.Subscriptions.Subscription
  alias FormDelegate.Teams.Team
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

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
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with :ok <- Authorizer.authorize(:create_checkout_session, current_user, current_membership),
         %Plan{} = plan <- Plans.get_plan_by(stripe_price_id: price_id),
         {:ok, stripe_customer_id} <- get_stripe_customer_id_for_team(current_user, current_team),
         {:ok, %Stripe.Checkout.Session{} = session} <-
           stripe_api().create_checkout_session(%{
             payment_method_types: [:card],
             mode: :subscription,
             customer: stripe_customer_id,
             line_items: [
               %{
                 price: plan.stripe_price_id,
                 quantity: 1
               }
             ],
             success_url:
               "#{frontend_url()}/account/billing?status=confirmed&stripe_session_id={CHECKOUT_SESSION_ID}",
             cancel_url: "#{frontend_url()}/account/billing?status=abandoned",
             subscription_data: %{
               items: [],
               metadata: %{
                 "team_id" => current_team.id
               }
             }
           }) do
      json(conn, session)
    else
      {:error, :forbidden} ->
        {:error, :forbidden}

      nil ->
        {:error, :bad_request}

      {:error, error} ->
        Logger.error("Stripe checkout session error: #{inspect(error)}")
        {:error, :bad_request}
    end
  end

  def retrieve_subscription(conn, %{"id" => stripe_subscription_id}, current_user) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with %Subscription{} = subscription <-
           Subscriptions.get_subscription!(stripe_subscription_id),
         :ok <-
           Authorizer.authorize(
             :retrieve_subscription,
             current_user,
             current_team,
             current_membership,
             subscription
           ) do
      stripe_subscription = stripe_api().retrieve_subscription(stripe_subscription_id)

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
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with %Subscription{} = subscription <-
           Subscriptions.get_subscription!(stripe_subscription_id),
         %Plan{} = plan <- Plans.get_plan_by(stripe_price_id: stripe_price_id),
         :ok <-
           Authorizer.authorize(
             :update_stripe_subscription,
             current_user,
             current_team,
             current_membership,
             subscription
           ) do
      {:ok,
       %Stripe.Subscription{
         items: %Stripe.List{
           data: stripe_subscription_items
         }
       } = _stripe_subscription} = stripe_api().retrieve_subscription(stripe_subscription_id)

      # Assumes a subscription only has one active subscription item
      %Stripe.SubscriptionItem{} =
        stripe_subscription_item =
        stripe_subscription_items
        |> Enum.at(0)

      updated_subscription =
        stripe_api().update_subscription(stripe_subscription_id, %{
          "items" => [%{"id" => stripe_subscription_item.id, "price" => plan.stripe_price_id}]
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
    else
      nil ->
        {:error, :bad_request}

      {:error, :forbidden} ->
        {:error, :forbidden}
    end
  end

  def create_portal(conn, _params, current_user) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership

    with :ok <- Authorizer.authorize(:create_portal, current_user, current_membership),
         {:ok, stripe_customer_id} <- get_stripe_customer_id_for_team(current_user, current_team),
         {:ok, %{url: portal_url}} <-
           stripe_api().create_billing_portal_session(%{
             customer: stripe_customer_id,
             return_url: "#{frontend_url()}/account/billing"
           }) do
      json(conn, %{url: portal_url})
    else
      {:error, :forbidden} ->
        {:error, :forbidden}

      {:error, error} ->
        Logger.error("Stripe portal session creation error: #{inspect(error)}")
        {:error, :bad_request}
    end
  end

  defp frontend_url do
    Application.fetch_env!(:form_delegate, :frontend_url)
  end

  defp stripe_api do
    Application.get_env(:form_delegate, :stripe_api)
  end

  defp get_stripe_customer_id_for_team(%User{} = user, %Team{} = team) do
    # Create a Stripe customer for the team if it doesn't exist
    if is_nil(team.stripe_customer_id) do
      customer_name = team.name || "#{user.name} (Team)"

      case stripe_api().create_customer(%{name: customer_name, email: user.email}) do
        {:ok, stripe_customer} ->
          {:ok, _team} =
            FormDelegate.Teams.update_team(team, %{stripe_customer_id: stripe_customer.id})

          {:ok, stripe_customer.id}

        {:error, error} ->
          Logger.error("Failed to create Stripe customer for team #{team.id}: #{inspect(error)}")
          {:error, :stripe_customer_create_failed}
      end
    else
      {:ok, team.stripe_customer_id}
    end
  end
end
