defmodule FormDelegateWeb.Plugs.SetPlan do
  import Plug.Conn
  alias FormDelegate.Plans
  alias FormDelegate.Subscriptions

  def init(_), do: nil

  def call(%{method: method} = conn, opts) when method in ["POST", "DELETE"] do
    set_plan(conn, opts)
  end

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

    case Subscriptions.get_active_subscription_for_team(team) do
      nil ->
        get_free_plan()

      %{plan: %FormDelegate.Plans.Plan{} = plan} ->
        plan

      _subscription ->
        get_free_plan()
    end
  end

  defp get_free_plan do
    Plans.get_free_plan()
  end
end
