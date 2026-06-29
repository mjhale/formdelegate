defmodule FormDelegateWeb.TeamMembershipView do
  use FormDelegateWeb, :view

  alias FormDelegateWeb.TeamMembershipView

  def render("index.json", %{memberships: memberships}) do
    %{data: render_many(memberships, TeamMembershipView, "membership.json")}
  end

  def render("show.json", %{membership: membership}) do
    %{data: render_one(membership, TeamMembershipView, "membership.json")}
  end

  def render("membership.json", %{team_membership: membership}) do
    %{
      id: membership.id,
      is_billing_account: membership.is_billing_account,
      user: render_user(membership.user)
    }
  end

  defp render_user(user) do
    %{
      id: user.id,
      email: user.email,
      name: user.name
    }
  end
end
