defmodule FormDelegateWeb.IntegrationView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.IntegrationView

  def render("index.json", %{integrations: integrations}) do
    %{data: render_many(integrations, IntegrationView, "integration.json")}
  end

  def render("show.json", %{integration: integration}) do
    %{data: render_one(integration, IntegrationView, "integration.json")}
  end

  def render("integration.json", %{integration: integration}) do
    %{
      id: integration.id,
      type: integration.type,
    }
  end
end
