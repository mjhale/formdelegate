defmodule FormDelegateWeb.UserView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.{TeamView, UserView}

  def render("index.json", %{users: users}) do
    %{data: render_many(users, UserView, "user.json")}
  end

  def render("show.json", %{
        user: user,
        current_team: current_team,
        current_membership: current_membership
      }) do
    %{
      data: %{
        user: render_one(user, UserView, "user.json"),
        current_team: render_one(current_team, TeamView, "team.json"),
        current_membership: render_membership(current_membership),
        memberships: render_memberships(user)
      }
    }
  end

  def render("sign_up.json", %{token: token, user: user}) do
    %{
      data: %{
        email: user.email,
        id: user.id,
        token: token
      }
    }
  end

  def render("user.json", %{user: user}) do
    %{
      confirmed_at: user.confirmed_at,
      email: user.email,
      form_count: user.form_count,
      id: user.id,
      is_admin: user.is_admin,
      name: user.name
    }
  end

  defp render_memberships(%{memberships: memberships}) when is_list(memberships) do
    Enum.map(memberships, &render_membership/1)
  end

  defp render_memberships(_user), do: []

  defp render_membership(nil), do: nil

  defp render_membership(membership) do
    %{
      id: membership.id,
      is_billing_account: membership.is_billing_account,
      team: render_one(membership.team, TeamView, "team.json")
    }
  end
end
