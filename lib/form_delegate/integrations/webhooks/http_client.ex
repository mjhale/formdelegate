defmodule FormDelegate.Integrations.Webhooks.HTTPClient do
  @moduledoc false

  def post(%{uri: uri, address: address}, headers, body) do
    # The TCP destination is the validated numeric address; retain the original
    # identity for HTTP routing, TLS SNI, and certificate hostname verification.
    pinned_url = URI.to_string(%{uri | host: address |> :inet.ntoa() |> to_string()})
    options = options(uri.host)

    case :hackney.request(:post, pinned_url, [{"Host", uri.host} | headers], body, options) do
      {:ok, status, _headers, ref} ->
        # Webhook acknowledgement uses status alone. Never buffer response bodies.
        :hackney.close(ref)
        {:ok, status}

      {:ok, status, _headers} ->
        {:ok, status}

      {:error, _reason} ->
        {:error, :request_failed}
    end
  end

  def options(host) do
    [
      pool: false,
      follow_redirect: false,
      no_proxy_env: true,
      connect_timeout: 5_000,
      recv_timeout: 5_000,
      ssl_options: :hackney_ssl.check_hostname_opts(String.to_charlist(host))
    ]
  end
end
