defmodule FormDelegateWeb.SessionView do
  use FormDelegateWeb, :view

  def render("show.json", %{user: user, jwt: jwt}) do
    %{
      jwt: jwt,
      user: render_one(user, FormDelegateWeb.UserView, "show.json")
    }
  end

  def render("error.json", _) do
    %{error: "Invalid username or password"}
  end

  def render("forbidden.json", %{"error": error}) do
    %{error: error}
  end
end
