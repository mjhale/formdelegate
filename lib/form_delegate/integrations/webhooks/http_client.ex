defmodule FormDelegate.Integrations.Webhooks.HTTPClient do
  @moduledoc false

  def post(%{uri: uri, address: address}, headers, body) do
    # The TCP destination is the validated numeric address; retain the original
    # identity for HTTP routing, TLS SNI, and certificate hostname verification.
    pinned_url = URI.to_string(%{uri | host: address |> :inet.ntoa() |> to_string()})
    options = options(uri.host)

    headers = [{"Host", uri.host} | headers]

    # Hackney 4's ordinary request/5 buffers the response body. Use its streaming
    # API so acknowledgements still read headers only and close immediately.
    case :hackney.request(:post, pinned_url, headers, :stream, options) do
      {:ok, ref} ->
        try do
          with :ok <- :hackney.send_body(ref, body),
               :ok <- :hackney.finish_send_body(ref),
               {:ok, status, _headers, ^ref} <- :hackney.start_response(ref) do
            {:ok, status}
          else
            {:error, _reason} -> {:error, :request_failed}
          end
        after
          :hackney.close(ref)
        end

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
