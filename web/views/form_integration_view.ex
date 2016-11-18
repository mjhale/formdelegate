defmodule FormDelegate.FormIntegrationView do
  use FormDelegate.Web, :view

  def render("index.json", %{form_integrations: form_integrations}) do
    %{
      data: render_many(
        form_integrations,
        FormDelegate.FormIntegrationView,
        "form_integration.json"
      )
    }
  end

  def render("show.json", %{form_integration: form_integration}) do
    %{
      data: render_one(
        form_integration,
        FormDelegate.FormIntegrationView,
        "form_integration.json"
      )
    }
  end

  def render("form_integration.json", %{form_integration: form_integration}) do
    %{
      id: form_integration.id,
      enabled: form_integration.enabled,
      settings: render_one(
        form_integration.settings,
        FormDelegate.SettingsView,
        "settings.json"
      ),
      integration: render_one(
        form_integration.integration,
        FormDelegate.IntegrationView,
        "integration.json"
      ),
      inserted_at: form_integration.inserted_at,
      updated_at: form_integration.updated_at,
    }
  end
end
