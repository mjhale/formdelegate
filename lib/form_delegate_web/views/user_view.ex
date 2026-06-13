defmodule FormDelegateWeb.UserView do
  use FormDelegateWeb, :view
  import Ecto.Query, warn: false
  alias FormDelegateWeb.{TeamView, UserView}
  alias FormDelegate.Memberships.Membership

  def render("index.json", %{users: users}) do
    %{data: render_many(users, UserView, "user.json")}
  end

  def render("show.json", %{user: user}) do
    %{data: render_one(user, UserView, "user.json")}
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
      name: user.name,
      membership: %{
        is_billing_account: get_is_billing_account(user)
      },
      team: render_one(user.team, TeamView, "team.json")
    }
  end

  defp get_is_billing_account(user) do
    case user.memberships do
      %Ecto.Association.NotLoaded{} ->
        if is_nil(user.team_id) do
          false
        else
          query =
            from m in Membership,
              where:
                m.user_id == ^user.id and m.team_id == ^user.team_id and
                  m.is_billing_account == true

          FormDelegate.Repo.exists?(query)
        end

      memberships when is_list(memberships) ->
        Enum.any?(memberships, fn m -> m.team_id == user.team_id and m.is_billing_account end)

      _ ->
        false
    end
  end
end
