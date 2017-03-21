defmodule FormDelegate.Admin.AccountView do
  use FormDelegate.Web, :view

  def render("index.json", %{accounts: accounts}) do
    %{data: render_many(accounts, FormDelegate.Admin.AccountView, "account.json")}
  end

  def render("show.json", %{account: account}) do
    %{data: render_one(account, FormDelegate.Admin.AccountView, "account.json")}
  end

  def render("account.json", %{account: account}) do
    %{
      id: account.id,
      email: account.email,
      name: account.name,
      form_count: account.form_count,
      verified: account.verified,
      admin: account.admin,
    }
  end
end
