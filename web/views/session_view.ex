defmodule FormDelegate.SessionView do
  use FormDelegate.Web, :view

  def render("show.json", %{jwt: jwt, account: account}) do
    %{
      jwt: jwt,
      account: render_one(account, FormDelegate.AccountView, "show.json")
    }
  end

  def render("error.json", _) do
    %{error: "Invalid username or password"}
  end

  def render("forbidden.json", %{"error": error}) do
    %{error: error}
  end
end
