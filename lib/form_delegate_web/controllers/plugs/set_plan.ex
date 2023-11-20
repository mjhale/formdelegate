defmodule FormDelegateWeb.Plugs.SetPlan do
  import Plug.Conn

  def init(_), do: nil

  def call(%{method: "POST"} = conn, opts), do: set_plan(conn, opts)

  def call(conn, _opts), do: conn

  # Valid for situations where current_user does not exist or is not relevant (e.g., external form submissions)
  defp set_plan(%{assigns: %{form: form}} = conn, _opts) do
    plan = get_plan_for_user(form.user)
    assign(conn, :plan, plan)
  end

  # Valid for where current_user does exist (e.g., on form creation)
  defp set_plan(%{assigns: %{current_user: current_user}} = conn, _opts) do
    plan = get_plan_for_user(current_user)
    assign(conn, :plan, plan)
  end

  defp get_plan_for_user(user) do
    case Enum.at(user.team.subscriptions, 0) do
      nil ->
        FormDelegate.Plans.get_plan_by!(name: "Free")

      subscriptions ->
        {:ok, stripe_subscription} =
          Stripe.Subscription.retrieve(Map.get(subscriptions, :stripe_subscription_id))

        stripe_subscription_item = Enum.at(stripe_subscription.items.data, 0)
        stripe_product_id = stripe_subscription_item.price.product

        FormDelegate.Plans.get_plan_by!(stripe_product_id: stripe_product_id)
    end
  end
end
