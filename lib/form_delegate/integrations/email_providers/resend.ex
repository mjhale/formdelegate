defmodule FormDelegate.Integrations.EmailProviders.Resend do
  @moduledoc "User-owned Resend sender for application-rendered submission notifications."
  @behaviour FormDelegate.Integrations.EmailProvider
  alias FormDelegate.Integrations.EmailProviders.Shared
  alias FormDelegate.Services.Resend

  @impl true
  def verify_credentials(config, secrets) do
    with :ok <- validate(config, secrets) do
      # Sending-only keys cannot list domains or API keys. Test only against
      # Resend's simulator; never send a probe to a customer's recipient.
      payload = %{
        "from" => Shared.map_value(config, "from_address"),
        "to" => ["delivered@resend.dev"],
        "subject" => "Form Delegate integration verification",
        "html" => "<p>Form Delegate email integration verification.</p>",
        "text" => "Form Delegate email integration verification."
      }

      case Resend.send_email(
             payload,
             Shared.map_value(secrets, "api_key"),
             "verify/#{Ecto.UUID.generate()}"
           ) do
        {:ok, _} ->
          :ok

        {:error, {:permanent, code}} when code in ["resend_http_401", "resend_http_403"] ->
          {:error, "invalid resend credentials or sender configuration"}

        {:error, {:permanent, _}} ->
          {:error, "invalid resend provider configuration"}

        {:error, _} ->
          {:error, "resend connection failed; retry verification later"}
      end
    end
  end

  def deliver_submission_email(integration, email) do
    case validate(integration.email_provider_config, integration.email_provider_secrets) do
      :ok ->
        Resend.send_email(
          submission_payload(integration, email),
          Shared.map_value(integration.email_provider_secrets, "api_key"),
          request_key(integration, email)
        )

      _ ->
        {:error, {:permanent, "invalid_resend_configuration"}}
    end
  end

  defp request_key(integration, email),
    do: "submission/#{email.assigns.submission.id}/#{integration.id}"

  defp submission_payload(integration, email) do
    config = integration.email_provider_config

    payload = %{
      "from" => Shared.map_value(config, "from_address"),
      "to" => Resend.recipients(email.to),
      "subject" => email.subject,
      "html" => email.html_body,
      "text" => email.text_body
    }

    Enum.reduce([{"cc", email.cc}, {"bcc", email.bcc}], payload, fn {field, values}, body ->
      case Resend.recipients(values) do
        [] -> body
        recipients -> Map.put(body, field, recipients)
      end
    end)
  end

  defp validate(config, secrets) when is_map(config) and is_map(secrets) do
    Enum.reduce_while(
      [{config, "from_address"}, {secrets, "api_key"}],
      :ok,
      &validate_value/2
    )
  end

  defp validate(_, _), do: {:error, "provider configuration is invalid"}

  defp validate_value({map, key}, _) do
    value = Shared.map_value(map, key)

    if is_binary(value) and String.trim(value) != "",
      do: {:cont, :ok},
      else: {:halt, {:error, "missing required value: #{key}"}}
  end
end
