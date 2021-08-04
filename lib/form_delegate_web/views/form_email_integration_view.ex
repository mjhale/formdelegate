defmodule FormDelegateWeb.FormEmailIntegrationView do
  use FormDelegateWeb, :view

  alias FormDelegateWeb.{
    FormEmailIntegrationRecipientView,
    FormEmailIntegrationView
  }

  def render("index.json", %{email_integrations: email_integrations}) do
    %{
      data:
        render_many(
          email_integrations,
          FormEmailIntegrationView,
          "form_email_integration.json"
        )
    }
  end

  def render("show.json", %{email_integration: email_integration}) do
    %{
      data:
        render_one(
          email_integration,
          FormEmailIntegrationView,
          "form_email_integration.json"
        )
    }
  end

  def render("form_email_integration.json", %{email_integration: email_integration}) do
    %{
      email_api_key: email_integration.email_api_key,
      email_from_address: email_integration.email_from_address,
      email_integration_recipients:
        render_many(
          email_integration.email_integration_recipients,
          FormEmailIntegrationRecipientView,
          "form_email_integration_recipient.json",
          as: :email_integration_recipient
        ),
      enabled: email_integration.enabled,
      id: email_integration.id,
      inserted_at: email_integration.inserted_at,
      updated_at: email_integration.updated_at
    }
  end
end
