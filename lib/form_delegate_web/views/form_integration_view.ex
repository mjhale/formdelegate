defmodule FormDelegateWeb.FormIntegrationView do
  use FormDelegateWeb, :view

  def render("index.json", %{form_integrations: form_integrations}) do
    %{
      data: render_many(
        form_integrations,
        FormDelegateWeb.FormIntegrationView,
        "form_integration.json"
      )
    }
  end

  def render("show.json", %{form_integration: form_integration}) do
    %{
      data: render_one(
        form_integration,
        FormDelegateWeb.FormIntegrationView,
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
        FormDelegateWeb.SettingsView,
        "settings.json"
      ),
      integration: render_one(
        form_integration.integration,
        FormDelegateWeb.IntegrationView,
        "integration.json"
      ),
      inserted_at: form_integration.inserted_at,
      updated_at: form_integration.updated_at,
    }
  end
end
