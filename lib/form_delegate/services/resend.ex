defmodule FormDelegate.Services.Resend do
  @moduledoc "Resend REST delivery. Errors never include provider bodies or credentials."
  alias FormDelegate.Integrations.EmailProviders.Shared

  def send_email(payload, api_key, key) when is_binary(api_key) and byte_size(api_key) > 0 do
    client =
      Application.get_env(:form_delegate, :resend_http_client, FormDelegate.Services.ResendHTTP)

    headers = [
      {"authorization", "Bearer " <> api_key},
      {"content-type", "application/json"},
      {"idempotency-key", key}
    ]

    case client.post("https://api.resend.com/emails", headers, payload) do
      {:ok, status, %{"id" => id}, _headers} when status in 200..299 and is_binary(id) ->
        {:ok, %{provider: :resend, id: id}}

      {:ok, status, body, _headers} ->
        classify(status, body)

      {:error, _} ->
        {:error, {:retryable, :resend_connection_failed}}
    end
  end

  def send_email(_, _, _), do: {:error, {:permanent, "missing_resend_api_key"}}

  defp classify(409, %{"name" => "concurrent_idempotent_requests"}),
    do: {:error, {:retryable, :resend_concurrent_request}}

  defp classify(status, _) when status == 429 or status in 500..599,
    do: {:error, {:retryable, :resend_unavailable}}

  # A changed payload under the same key is terminal. Never generate a new key
  # for this retry: only a new explicit send attempt should receive a new key.
  defp classify(status, _) when status in 400..499,
    do: {:error, {:permanent, "resend_http_#{status}"}}

  defp classify(_, _), do: {:error, {:retryable, :resend_invalid_response}}

  def recipients(values) do
    values
    |> Shared.normalize_recipients()
    |> Enum.map(&Shared.format_recipient_for_header/1)
  end
end
