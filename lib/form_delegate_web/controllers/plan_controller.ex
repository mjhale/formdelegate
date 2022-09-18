defmodule FormDelegateWeb.PlanController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Plans, Plans.Plan}
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, _params, current_user) do
    with :ok <- Authorizer.authorize(:show_plans, current_user) do
      plans = Plans.list_plans()
      render(conn, "index.json", plans: plans)
    end
  end

  def create(conn, %{"plan" => plan_params}, current_user) do
    with :ok <- Authorizer.authorize(:create_plan, current_user),
         {:ok, %Plan{} = plan} <- Plans.create_plan(plan_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.plan_path(conn, :show, plan.id))
      |> render("show.json", plan: plan)
    end
  end

  def show(conn, %{"id" => id}, current_user) do
    with %Plan{} = plan <- Plans.get_plan!(id),
         :ok <- Authorizer.authorize(:show_plan, current_user, plan) do
      render(conn, "show.json", plan: plan)
    end
  end

  def update(conn, %{"id" => id, "plan" => plan_params}, current_user) do
    with %Plan{} = plan <- Plans.get_plan!(id),
         :ok <- Authorizer.authorize(:update_plan, current_user, plan),
         {:ok, %Plan{} = plan} <- Plans.update_plan(plan, plan_params) do
      render(conn, "show.json", plan: plan)
    end
  end

  def delete(conn, %{"id" => id}, current_user) do
    with %Plan{} = plan <- Plans.get_plan!(id),
         :ok <- Authorizer.authorize(:delete_plan, current_user, plan),
         {:ok, %Plan{} = _form} <- Plans.delete_plan(plan) do
      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:no_content, "")
    end
  end
end
