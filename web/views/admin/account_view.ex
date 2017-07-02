defmodule FormDelegate.Admin.AccountView do
  use FormDelegate.Web, :view

  def render("index.json", %{accounts: accounts}) do
    %{data: render_many(accounts, FormDelegate.AccountView, "account.json")}
  end

  def render("show.json", %{account: account}) do
    %{data: render_one(account, FormDelegate.AccountView, "account.json")}
  end
end
