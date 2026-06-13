defmodule FormDelegateWeb.TeamView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.{SubscriptionView, TeamView}

  def render("show.json", %{team: team}) do
    %{data: render_one(team, TeamView, "team.json")}
  end

  def render("team.json", %{team: team}) do
    %{
      id: team.id,
      name: team.name,
      stripe_customer_id: team.stripe_customer_id,
      subscriptions: render_many(team.subscriptions, SubscriptionView, "subscription.json")
    }
  end
end
