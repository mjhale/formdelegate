defmodule FormDelegateWeb.UserView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.UserView

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
      name: user.name
    }
  end
end
