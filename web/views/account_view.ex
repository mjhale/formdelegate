defmodule FormDelegate.AccountView do
  use FormDelegate.Web, :view

  def render("account.json", %{account: account}) do
    %{
      id: account.id,
      email: account.email,
      name: account.name,
      form_count: account.form_count,
      verified: account.verified,
      is_admin: account.is_admin,
    }
  end

  def render("show.json", %{account: account}) do
    %{data: render_one(account, FormDelegate.AccountView, "account.json")}
  end
end

