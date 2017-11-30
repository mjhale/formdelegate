defmodule FormDelegateWeb.Admin.UserView do
  use FormDelegateWeb, :view

  def render("index.json", %{users: users}) do
    %{data: render_many(users, FormDelegateWeb.UserView, "user.json")}
  end

  def render("show.json", %{user: user}) do
    %{data: render_one(user, FormDelegateWeb.UserView, "user.json")}
  end
end
