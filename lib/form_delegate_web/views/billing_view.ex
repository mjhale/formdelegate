defmodule FormDelegateWeb.BillingView do
  use FormDelegateWeb, :view

  alias FormDelegateWeb.PlanView
  alias FormDelegateWeb.SubscriptionView

  def render("usage.json", %{usage: usage}) do
    %{
      data: %{
        team_id: usage.team_id,
        plan: render_one(usage.plan, PlanView, "plan.json"),
        subscription: render_subscription(usage.subscription),
        period: usage.period,
        usage: %{
          forms: render_usage_line(usage.usage.forms),
          submissions: render_usage_line(usage.usage.submissions),
          storage: render_usage_line(usage.usage.storage)
        }
      }
    }
  end

  defp render_subscription(nil), do: nil

  defp render_subscription(subscription) do
    Phoenix.View.render_one(subscription, SubscriptionView, "subscription.json")
  end

  defp render_usage_line(usage) do
    usage
    |> Map.update!(:status, &to_string/1)
  end
end
