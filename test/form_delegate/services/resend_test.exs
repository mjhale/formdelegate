defmodule FormDelegate.Services.ResendTest do
  use ExUnit.Case, async: false
  alias FormDelegate.Services.Resend

  defmodule Transport do
    def post(url, headers, body) do
      send(self(), {:resend_request, url, headers, body})
      Process.get(:resend_response, {:ok, 200, %{"id" => "email-accepted"}, []})
    end
  end

  setup do
    previous = Application.fetch_env(:form_delegate, :resend_http_client)
    Application.put_env(:form_delegate, :resend_http_client, Transport)

    on_exit(fn ->
      case previous do
        {:ok, client} -> Application.put_env(:form_delegate, :resend_http_client, client)
        :error -> Application.delete_env(:form_delegate, :resend_http_client)
      end
    end)

    :ok
  end

  test "sends the current payload once per invocation, preserving the logical key and provider ID" do
    for payload <- [%{"text" => "Original"}, %{"text" => "Changed"}] do
      assert {:ok, %{id: "email-accepted", provider: :resend}} =
               Resend.send_email(payload, "synthetic-key", "logical-send")

      assert_receive {:resend_request, "https://api.resend.com/emails", headers, ^payload}
      assert {"authorization", "Bearer synthetic-key"} in headers
      assert {"idempotency-key", "logical-send"} in headers
      refute_receive {:resend_request, _, _, _}
    end
  end

  test "classifies permanent responses without returning sensitive provider bodies" do
    for status <- [400, 401, 403, 404, 409, 422] do
      Process.put(:resend_response, {:ok, status, %{"message" => "SECRET"}, []})
      assert {:error, {:permanent, reason}} = Resend.send_email(%{}, "synthetic", "key")
      refute reason =~ "SECRET"
    end
  end

  test "network, 5xx, rate limits and concurrent requests are retryable without an internal scheduler" do
    for response <- [
          {:error, "SECRET"},
          {:ok, 503, %{"message" => "SECRET"}, []},
          {:ok, 429, %{}, [{"retry-after", "900"}]},
          {:ok, 409, %{"name" => "concurrent_idempotent_requests"}, []},
          {:ok, 200, %{}, []}
        ] do
      Process.put(:resend_response, response)
      assert {:error, {:retryable, _reason}} = Resend.send_email(%{}, "synthetic", "key")
      assert_receive {:resend_request, _, _, _}
      refute_receive {:resend_request, _, _, _}
    end
  end

  test "missing credentials never reach the transport" do
    assert {:error, {:permanent, "missing_resend_api_key"}} = Resend.send_email(%{}, nil, "key")
    refute_receive {:resend_request, _, _, _}
  end

  test "sending and sanitized failures do not log recipient, body or credentials" do
    previous = Logger.level()
    Logger.configure(level: :debug)
    on_exit(fn -> Logger.configure(level: previous) end)
    payload = %{"to" => ["private-recipient@example.test"], "text" => "private-reset-link"}
    Process.put(:resend_response, {:error, "private-api-key"})

    log =
      ExUnit.CaptureLog.capture_log([level: :debug], fn ->
        assert {:error, {:retryable, _}} =
                 Resend.send_email(payload, "private-api-key", "redacted-send")
      end)

    for secret <- ["private-recipient@example.test", "private-reset-link", "private-api-key"],
        do: refute(log =~ secret)
  end
end
