defmodule FormDelegate.Integrations.WebhookTest do
  use ExUnit.Case, async: false
  alias FormDelegate.Integrations.{WebhookDispatcher, WebhookIntegration}
  alias FormDelegate.Integrations.Webhooks.{Bounded, HTTPClient, Target}
  setup do: FormDelegate.WebhookTestSetup.install()

  test "URL validation rejects unsafe syntax before DNS and accepts public HTTPS paths/query" do
    for url <- [
          "http://hooks.vendor.com",
          "https://user:pass@hooks.vendor.com",
          "https://hooks.vendor.com/#secret",
          "https://hooks.vendor.com:444",
          "https://localhost",
          "https://a.local",
          "https://a.internal",
          "https://a.localdomain",
          "https://a.intranet",
          "https://example.com",
          "https://EXAMPLE.COM",
          "https://a.example.org",
          "https://127.0.0.1",
          "https://2130706433",
          "https://0x7f000001",
          "https://[::1]",
          "https://[::ffff:127.0.0.1]",
          "https://hooks.vendor.com.",
          "https://a.test",
          "https://a..com"
        ] do
      assert {:error, _} = Target.validate(url), url
    end

    refute_receive {:resolved, _}

    assert {:ok, %{uri: uri, address: {93, 184, 215, 14}}} =
             Target.validate("https://hooks.vendor.com:443/events?token=abc")

    assert uri.path == "/events"
    assert uri.query == "token=abc"
  end

  test "all DNS answers must be public including IPv6 and DNS is repeated" do
    for addresses <- [
          [{93, 184, 215, 14}, {127, 0, 0, 1}],
          [{93, 184, 215, 14}, {0, 0, 0, 0, 0, 0, 0, 1}],
          []
        ] do
      Application.put_env(:form_delegate, :webhook_test_addresses, {:ok, addresses})
      assert {:error, _} = Target.validate("https://hooks.vendor.com")
    end

    Application.put_env(:form_delegate, :webhook_test_addresses, {:error, :timeout})
    assert {:error, _} = Target.validate("https://hooks.vendor.com")
  end

  test "special IP ranges cannot be destinations" do
    for text <-
          ~w(0.1.2.3 10.1.2.3 100.64.0.1 127.0.0.1 169.254.169.254 172.16.0.1 192.0.0.8 192.0.2.1 192.88.99.1 192.168.0.1 198.18.0.1 198.51.100.1 203.0.113.1 224.0.0.1 255.255.255.255 :: ::1 ::ffff:8.8.8.8 64:ff9b::808:808 fc00::1 fe80::1 ff00::1 2001:db8::1 2001::1 2002:0808:0808::1 3fff::1) do
      {:ok, address} = :inet.parse_address(String.to_charlist(text))
      refute Target.public_address?(address), text
    end

    for text <- ~w(8.8.8.8 93.184.215.14 2606:4700:4700::1111) do
      {:ok, address} = :inet.parse_address(String.to_charlist(text))
      assert Target.public_address?(address)
    end
  end

  test "signs exact raw JSON bytes and supplies stable event identity" do
    submission = %FormDelegate.Submissions.Submission{
      id: Ecto.UUID.generate(),
      form_id: Ecto.UUID.generate(),
      fields: %{"message" => "hello"},
      sender: "Ada",
      body: "hello",
      inserted_at: ~U[2026-10-31 10:00:00.000000Z],
      updated_at: ~U[2026-10-31 10:00:00.000000Z]
    }

    secret = String.duplicate("s", 32)

    integration = %WebhookIntegration{
      url: "https://hooks.vendor.com/event",
      signing_secret: secret
    }

    assert :ok = WebhookDispatcher.deliver(integration, submission)

    assert_receive {:webhook_request,
                    %{uri: %{host: "hooks.vendor.com"}, address: {93, 184, 215, 14}}, headers,
                    raw}

    headers = Map.new(headers)
    assert headers["X-FormDelegate-Id"] == submission.id

    expected =
      :crypto.mac(:hmac, :sha256, secret, headers["X-FormDelegate-Timestamp"] <> "." <> raw)
      |> Base.encode16(case: :lower)

    assert headers["X-FormDelegate-Signature"] == "v1=" <> expected

    assert %{
             "id" => id,
             "type" => "submission.received",
             "form_id" => form_id,
             "submission" => %{
               "fields" => %{"message" => "hello"},
               "inserted_at" => "2026-10-31T10:00:00.000000Z"
             }
           } = Jason.decode!(raw)

    assert id == submission.id and form_id == submission.form_id
    refute String.contains?(raw, secret)
    Application.put_env(:form_delegate, :webhook_test_response, {:ok, 302})
    assert {:error, _} = WebhookDispatcher.deliver(integration, submission)
    Application.put_env(:form_delegate, :webhook_test_addresses, {:ok, [{10, 0, 0, 1}]})
    assert_receive {:webhook_request, _, _, _}
    assert {:error, _} = WebhookDispatcher.deliver(integration, submission)
    refute_receive {:webhook_request, _, _, _}
  end

  test "transport disables proxies, pooling, redirects and verifies original TLS host" do
    options = HTTPClient.options("hooks.vendor.com")

    assert options[:pool] == false and options[:follow_redirect] == false and
             options[:no_proxy_env] == true

    assert options[:connect_timeout] == 5000 and options[:recv_timeout] == 5000
    assert options[:ssl_options][:verify] == :verify_peer
    assert options[:ssl_options][:server_name_indication] == ~c"hooks.vendor.com"
    assert {_fun, [check_hostname: ~c"hooks.vendor.com"]} = options[:ssl_options][:verify_fun]
    refute Keyword.has_key?(options, :with_body)
  end

  test "bounded workers are killed and their monitors/messages are removed" do
    owner = self()

    assert {:error, :timeout} =
             Bounded.run(
               fn ->
                 send(owner, {:worker, self()})

                 receive do
                   :never -> :ok
                 end
               end,
               20
             )

    assert_receive {:worker, worker}
    refute Process.alive?(worker)
    refute_receive {:DOWN, _, _, _, _}
    assert {:error, :worker_failed} = Bounded.run(fn -> exit(:synthetic) end, 100)
    assert :ok = Bounded.run(fn -> :ok end, 100)
  end

  test "new and disabled webhook secrets are required and redacted" do
    secret = String.duplicate("s", 32)
    valid = %{enabled: false, url: "https://hooks.vendor.com", signing_secret: secret}
    assert WebhookIntegration.changeset(%WebhookIntegration{}, valid).valid?

    refute WebhookIntegration.changeset(%WebhookIntegration{}, Map.delete(valid, :signing_secret)).valid?

    refute WebhookIntegration.changeset(%WebhookIntegration{}, %{valid | signing_secret: "short"}).valid?

    refute inspect(%WebhookIntegration{signing_secret: secret}) =~ secret
  end
end
