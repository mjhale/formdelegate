defmodule FormDelegateWeb.ResendAdapter do
  @moduledoc "Bamboo bridge sending EEx-rendered platform email bodies over Resend REST."
  @behaviour Bamboo.Adapter
  alias FormDelegate.Services.Resend

  @impl true
  def deliver(email, config) do
    key = email.private[:resend_key]

    if is_binary(key) and key != "" do
      payload = %{
        "from" => config.from,
        "to" => Resend.recipients(email.to),
        "subject" => email.subject,
        "html" => email.html_body,
        "text" => email.text_body
      }

      Resend.send_email(payload, config.api_key, key)
    else
      {:error, {:permanent, "missing_resend_key"}}
    end
  end

  @impl true
  def handle_config(config), do: config
  @impl true
  def supports_attachments?, do: false
end
