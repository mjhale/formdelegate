defmodule FormDelegate.Integrations.EmailProviders.SendGrid do
  @behaviour FormDelegate.Integrations.EmailProvider

  alias Bamboo.Email
  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Integrations.EmailProviders.HTTPClient.Tesla, as: DefaultHTTPClient
  alias FormDelegate.Integrations.EmailProviders.Shared

  @impl true
  def verify_credentials(config, secrets) when is_map(config) and is_map(secrets) do
    with :ok <- validate_present(config, "from_address"),
         :ok <- validate_present(secrets, "api_key"),
         api_key <- map_value(secrets, "api_key"),
         {:ok, status, _body} <-
           http_client().get("https://api.sendgrid.com/v3/user/account", [
             {"accept", "application/json"},
             {"authorization", "Bearer #{api_key}"}
           ]) do
      case status do
        code when code in 200..299 -> :ok
        401 -> {:error, "invalid sendgrid credentials"}
        403 -> {:error, "invalid sendgrid credentials"}
        _ -> {:error, "sendgrid verification failed with status #{status}"}
      end
    end
  end

  def verify_credentials(_config, _secrets), do: {:error, "provider configuration is invalid"}

  @spec deliver_submission_email(%EmailIntegration{}, %Email{}) ::
          {:ok, map()} | {:error, String.t()}
  def deliver_submission_email(%EmailIntegration{} = email_integration, %Email{} = email) do
    config = email_integration.email_provider_config || %{}
    secrets = email_integration.email_provider_secrets || %{}

    with :ok <- validate_present(config, "from_address"),
         :ok <- validate_present(secrets, "api_key"),
         api_key <- map_value(secrets, "api_key"),
         body <- build_delivery_body(email, config),
         {:ok, status, response_body} <-
           http_client().post(
             "https://api.sendgrid.com/v3/mail/send",
             [
               {"accept", "application/json"},
               {"content-type", "application/json"},
               {"authorization", "Bearer #{api_key}"}
             ],
             body
           ) do
      case status do
        code when code in 200..299 ->
          {:ok, %{provider: :sendgrid, status: status, response: response_body}}

        _ ->
          {:error, "sendgrid delivery failed with status #{status}"}
      end
    end
  end

  defp build_delivery_body(email, config) do
    to = email.to |> Shared.normalize_recipients() |> Enum.map(&to_sendgrid_recipient/1)
    cc = email.cc |> Shared.normalize_recipients() |> Enum.map(&to_sendgrid_recipient/1)
    bcc = email.bcc |> Shared.normalize_recipients() |> Enum.map(&to_sendgrid_recipient/1)

    personalization =
      %{
        "to" => to,
        "subject" => email.subject
      }
      |> maybe_put("cc", cc)
      |> maybe_put("bcc", bcc)

    %{
      "personalizations" => [personalization],
      "from" => %{"email" => map_value(config, "from_address")},
      "content" => build_contents(email)
    }
  end

  defp build_contents(email) do
    []
    |> maybe_add_content("text/plain", email.text_body)
    |> maybe_add_content("text/html", email.html_body)
  end

  defp maybe_add_content(contents, _type, nil), do: contents
  defp maybe_add_content(contents, _type, ""), do: contents

  defp maybe_add_content(contents, type, body) do
    contents ++ [%{"type" => type, "value" => body}]
  end

  defp maybe_put(map, _key, []), do: map
  defp maybe_put(map, key, value), do: Map.put(map, key, value)

  defp to_sendgrid_recipient(%{email: email, name: nil}), do: %{"email" => email}
  defp to_sendgrid_recipient(%{email: email, name: name}), do: %{"email" => email, "name" => name}

  defp http_client do
    Application.get_env(:form_delegate, :email_provider_http_client, DefaultHTTPClient)
  end

  defp validate_present(map, key) do
    case map_value(map, key) do
      nil -> {:error, "missing required value: #{key}"}
      "" -> {:error, "missing required value: #{key}"}
      _value -> :ok
    end
  end

  defp map_value(map, key), do: Shared.map_value(map, key)
end
