defmodule FormDelegate.Integrations.EmailProviders.SMTP do
  @behaviour FormDelegate.Integrations.EmailProvider

  alias FormDelegate.Integrations.EmailProviders.SMTPClient.Socket, as: DefaultSMTPClient

  @impl true
  def verify_credentials(config, secrets) when is_map(config) and is_map(secrets) do
    with :ok <- validate_present(config, "host"),
         :ok <- validate_present(config, "port"),
         :ok <- validate_present(config, "username"),
         :ok <- validate_present(config, "from_address"),
         :ok <- validate_present(secrets, "password"),
         {:ok, port} <- parse_port(map_value(config, "port")),
         :ok <-
           smtp_client().verify(%{
             host: map_value(config, "host"),
             port: port,
             username: map_value(config, "username"),
             password: map_value(secrets, "password"),
             use_ssl: parse_bool(map_value(config, "use_ssl"))
           }) do
      :ok
    end
  end

  def verify_credentials(_config, _secrets), do: {:error, "provider configuration is invalid"}

  defp smtp_client do
    Application.get_env(:form_delegate, :email_provider_smtp_client, DefaultSMTPClient)
  end

  defp parse_port(port) when is_integer(port) and port > 0, do: {:ok, port}

  defp parse_port(port) when is_binary(port) do
    case Integer.parse(port) do
      {parsed_port, ""} when parsed_port > 0 -> {:ok, parsed_port}
      _ -> {:error, "invalid SMTP port"}
    end
  end

  defp parse_port(_value), do: {:error, "invalid SMTP port"}

  defp parse_bool(nil), do: false
  defp parse_bool(value) when value in [true, "true", 1, "1"], do: true
  defp parse_bool(_value), do: false

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
