defmodule FormDelegate.AccountView do
  use FormDelegate.Web, :view

  def render("index.json", %{accounts: accounts}) do
    %{data: render_many(accounts, FormDelegate.AccountView, "account.json")}
  end

  def render("show.json", %{account: account}) do
    %{data: render_one(account, FormDelegate.AccountView, "account.json")}
  end

  def render("account.json", %{account: account}) do
    %{
      id: account.id,
      name: account.name,
      username: account.username,
      messages: render_many(account.messages, FormDelegate.MessageView, "message.json")
    }
  end
end
