defmodule FormDelegateWeb.PlanView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.PlanView

  def render("index.json", %{plans: plans}) do
    %{data: render_many(plans, PlanView, "plan.json")}
  end

  def render("show.json", %{plan: plan}) do
    %{data: render_one(plan, PlanView, "plan.json")}
  end

  def render("plan.json", %{plan: plan}) do
    %{
      id: plan.id,
      name: plan.name,
      stripe_product_id: plan.stripe_product_id,
      limit_submissions: plan.limit_submissions,
      limit_forms: plan.limit_forms,
      limit_storage: plan.limit_storage,
      inserted_at: plan.inserted_at,
      updated_at: plan.updated_at
    }
  end
end
