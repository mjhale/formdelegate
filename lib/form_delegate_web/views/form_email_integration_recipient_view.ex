defmodule FormDelegateWeb.FormEmailIntegrationRecipientView do
  use FormDelegateWeb, :view

  def render("form_email_integration_recipient.json", %{
        email_integration_recipient: email_integration_recipient
      }) do
    %{
      id: email_integration_recipient.id,
      email: email_integration_recipient.email,
      name: email_integration_recipient.name,
      type: email_integration_recipient.type
    }
  end
end
