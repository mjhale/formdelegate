defmodule FormDelegate.Integrations.EmailProviders.SendGrid do
  @behaviour FormDelegate.Integrations.EmailProvider

  alias FormDelegate.Integrations.EmailProviders.HTTPClient.Tesla, as: DefaultHTTPClient

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

  defp map_value(map, key) do
    Map.get(map, key) || Map.get(map, String.to_atom(key))
  end
end
