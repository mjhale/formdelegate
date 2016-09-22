defmodule FormDelegate.AccountView do
  use FormDelegate.Web, :view

  def render("index.json", %{accounts: accounts}) do
    %{data: render_many(accounts, FormDelegate.AccountView, "account.json")}
  end

  def render("show.json", %{account: account}) do
    %{data: render_one(account, FormDelegate.AccountView, "account.json")}
  end

  def render("account.json", %{account: account}) do
    %{id: account.id,
      name: account.name,
      password: account.password,
      password_hash: account.password_hash,
      username: account.username}
  end
end
