defmodule FormDelegateWeb.Plugs.SetPlan do
  import Plug.Conn
  alias FormDelegate.Plans.Plan

  def init(_), do: nil

  def call(%{method: "POST"} = conn, opts), do: set_plan(conn, opts)

  def call(conn, _opts), do: conn

  # Valid for situations where current_user does not exist or is not relevant (e.g., external form submissions)
  defp set_plan(%{assigns: %{form: form}} = conn, _opts) do
    plan = get_plan_for_team(form.team)
    assign(conn, :plan, plan)
  end

  defp set_plan(%{assigns: %{current_team: current_team}} = conn, _opts) do
    plan = get_plan_for_team(current_team)
    assign(conn, :plan, plan)
  end

  defp get_plan_for_team(nil), do: get_free_plan()
  defp get_plan_for_team(%Ecto.Association.NotLoaded{}), do: get_free_plan()

  defp get_plan_for_team(team) do
    team =
      FormDelegate.Repo.preload(team, subscriptions: [:plan])

    subscriptions = Map.get(team, :subscriptions, [])

    case Enum.at(subscriptions, 0) do
      nil ->
        get_free_plan()

      subscription ->
        if subscription.stripe_subscription_status in ["active", "trialing"] do
          case subscription.plan do
            %FormDelegate.Plans.Plan{} = plan ->
              plan

            _ ->
              get_free_plan()
          end
        else
          get_free_plan()
        end
    end
  end

  defp get_free_plan do
    case FormDelegate.Repo.get_by(Plan, name: "Free") do
      nil ->
        %Plan{
          name: "Free",
          limit_submissions: 100,
          limit_forms: 0,
          limit_storage: 5_000_000
        }

      plan ->
        plan
    end
  end
end
