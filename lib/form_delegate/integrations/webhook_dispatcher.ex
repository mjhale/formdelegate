defmodule FormDelegate.Integrations.WebhookDispatcher do
  @moduledoc "Signed submission events with bounded, DNS-pinned HTTPS delivery."
  alias FormDelegate.Integrations.Webhooks.{Bounded, HTTPClient, Target}
  @test_build Mix.env() == :test

  def deliver(integration, submission) do
    Bounded.run(fn -> deliver_bounded(integration, submission) end, 15_000)
  end

  defp deliver_bounded(integration, submission) do
    with {:ok, target} <- Target.validate(integration.url) do
      body = Jason.encode!(payload(submission))
      timestamp = Integer.to_string(System.system_time(:second))
      headers = headers(submission.id, timestamp, body, integration.signing_secret)

      case client().post(target, headers, body) do
        {:ok, status} when status in 200..299 -> :ok
        _ -> {:error, :webhook_delivery_failed}
      end
    end
  end

  def payload(submission) do
    %{
      id: submission.id,
      type: "submission.received",
      form_id: submission.form_id,
      submission: %{
        id: submission.id,
        fields: submission.fields || %{},
        sender: submission.sender,
        body: submission.body,
        inserted_at: submission.inserted_at,
        updated_at: submission.updated_at
      }
    }
  end

  def headers(id, timestamp, body, secret) do
    signature =
      :crypto.mac(:hmac, :sha256, secret, timestamp <> "." <> body) |> Base.encode16(case: :lower)

    [
      {"Content-Type", "application/json"},
      {"X-FormDelegate-Id", id},
      {"X-FormDelegate-Timestamp", timestamp},
      {"X-FormDelegate-Signature", "v1=" <> signature}
    ]
  end

  if @test_build do
    defp client, do: Application.get_env(:form_delegate, :webhook_http_client, HTTPClient)
  else
    defp client, do: HTTPClient
  end
end
