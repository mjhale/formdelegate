defmodule FormDelegate.Integrations.EmailDispatcher do
  alias Bamboo.Email

  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Integrations.EmailProviders.{Postmark, SMTP, SendGrid}

  @provider_modules %{
    smtp: SMTP,
    postmark: Postmark,
    sendgrid: SendGrid
  }

  @spec deliver_submission_email(%EmailIntegration{}, %Email{}) ::
          {:ok, map()} | {:error, String.t()}
  def deliver_submission_email(%EmailIntegration{} = email_integration, %Email{} = email) do
    case Map.get(@provider_modules, email_integration.email_provider) do
      nil ->
        {:error, "unsupported email provider"}

      provider_module ->
        provider_module.deliver_submission_email(email_integration, email)
    end
  end
end
