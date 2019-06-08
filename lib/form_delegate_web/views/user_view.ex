defmodule FormDelegateWeb.UserView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.UserView

  def render("index.json", %{users: users}) do
    %{data: render_many(users, UserView, "user.json")}
  end

  def render("show.json", %{user: user}) do
    %{data: render_one(user, UserView, "user.json")}
  end

  def render("user.json", %{user: user}) do
    %{
      id: user.id,
      email: user.email,
      name: user.name,
      form_count: user.form_count,
      verified: user.verified,
      is_admin: user.is_admin
    }
  end
end
