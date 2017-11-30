defmodule FormDelegateWeb.Admin.IntegrationView do
  use FormDelegateWeb, :view

  def render("index.json", %{integrations: integrations}) do
    %{data: render_many(integrations, FormDelegateWeb.IntegrationView, "integration.json")}
  end

  def render("show.json", %{integration: integration}) do
    %{data: render_one(integration, FormDelegateWeb.IntegrationView, "integration.json")}
  end
end
