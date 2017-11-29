defmodule FormDelegate.Admin.IntegrationView do
  use FormDelegate.Web, :view

  def render("index.json", %{integrations: integrations}) do
    %{data: render_many(integrations, FormDelegate.IntegrationView, "integration.json")}
  end

  def render("show.json", %{integration: integration}) do
    %{data: render_one(integration, FormDelegate.IntegrationView, "integration.json")}
  end
end
