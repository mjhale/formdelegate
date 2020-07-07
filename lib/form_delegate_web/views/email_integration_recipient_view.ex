defmodule FormDelegateWeb.EmailIntegrationRecipientView do
  use FormDelegateWeb, :view

  def render("email_integration_recipient.json", %{
        email_integration_recipient: email_integration_recipient
      }) do
    %{
      email: email_integration_recipient.email,
      name: email_integration_recipient.name,
      type: email_integration_recipient.type
    }
  end
end
