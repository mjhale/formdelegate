defmodule FormDelegate.Integrations.EmailProviders.Postmark do
  @behaviour FormDelegate.Integrations.EmailProvider

  alias Bamboo.Email
  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Integrations.EmailProviders.HTTPClient.Tesla, as: DefaultHTTPClient
  alias FormDelegate.Integrations.EmailProviders.Shared

  @impl true
  def verify_credentials(config, secrets) when is_map(config) and is_map(secrets) do
    with :ok <- validate_present(config, "from_address"),
         :ok <- validate_present(secrets, "server_token"),
         token <- map_value(secrets, "server_token"),
         {:ok, status, _body} <-
           http_client().get("https://api.postmarkapp.com/server", [
             {"accept", "application/json"},
             {"x-postmark-server-token", token}
           ]) do
      case status do
        code when code in 200..299 -> :ok
        401 -> {:error, "invalid postmark credentials"}
        _ -> {:error, "postmark verification failed with status #{status}"}
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
         :ok <- validate_present(secrets, "server_token"),
         token <- map_value(secrets, "server_token"),
         body <- build_delivery_body(email, config),
         {:ok, status, response_body} <-
           http_client().post(
             "https://api.postmarkapp.com/email",
             [
               {"accept", "application/json"},
               {"content-type", "application/json"},
               {"x-postmark-server-token", token}
             ],
             body
           ) do
      case status do
        code when code in 200..299 ->
          {:ok, %{provider: :postmark, status: status, response: response_body}}

        _ ->
          {:error, "postmark delivery failed with status #{status}"}
      end
    end
  end

  defp build_delivery_body(email, config) do
    to_header =
      email.to
      |> Shared.normalize_recipients()
      |> Enum.map(&Shared.format_recipient_for_header/1)
      |> Enum.join(",")

    cc_header =
      email.cc
      |> Shared.normalize_recipients()
      |> Enum.map(&Shared.format_recipient_for_header/1)
      |> Enum.join(",")

    bcc_header =
      email.bcc
      |> Shared.normalize_recipients()
      |> Enum.map(&Shared.format_recipient_for_header/1)
      |> Enum.join(",")

    %{
      "From" => map_value(config, "from_address"),
      "To" => to_header,
      "Cc" => blank_to_nil(cc_header),
      "Bcc" => blank_to_nil(bcc_header),
      "Subject" => email.subject,
      "HtmlBody" => email.html_body,
      "TextBody" => email.text_body
    }
    |> maybe_put_message_stream(map_value(config, "message_stream"))
  end

  defp maybe_put_message_stream(body, stream) when is_binary(stream) do
    case String.trim(stream) do
      "" -> body
      trimmed_stream -> Map.put(body, "MessageStream", trimmed_stream)
    end
  end

  defp maybe_put_message_stream(body, nil), do: body
  defp maybe_put_message_stream(body, stream), do: Map.put(body, "MessageStream", stream)

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
  defp blank_to_nil(""), do: nil
  defp blank_to_nil(value), do: value
end
