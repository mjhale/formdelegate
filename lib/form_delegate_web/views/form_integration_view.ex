defmodule FormDelegateWeb.FormIntegrationView do
  use FormDelegateWeb, :view
  alias FormDelegateWeb.{EmailIntegrationRecipientView, FormIntegrationView, IntegrationView}

  def render("index.json", %{form_integrations: form_integrations}) do
    %{
      data:
        render_many(
          form_integrations,
          FormIntegrationView,
          "form_integration.json"
        )
    }
  end

  def render("show.json", %{form_integration: form_integration}) do
    %{
      data:
        render_one(
          form_integration,
          FormIntegrationView,
          "form_integration.json"
        )
    }
  end

  def render("form_integration.json", %{form_integration: form_integration}) do
    %{
      email_api_key: form_integration.email_api_key,
      email_from_address: form_integration.email_from_address,
      email_integration_recipients:
        render_many(
          form_integration.email_integration_recipients,
          EmailIntegrationRecipientView,
          "email_integration_recipient.json"
        ),
      enabled: form_integration.enabled,
      id: form_integration.id,
      inserted_at: form_integration.inserted_at,
      integration:
        render_one(
          form_integration.integration,
          IntegrationView,
          "integration.json"
        ),
      updated_at: form_integration.updated_at
    }
  end
end
