defmodule FormDelegate.Services.ResendHTTP do
  @moduledoc false
  def post(url, headers, body) do
    client =
      Tesla.client([
        {Tesla.Middleware.Timeout, timeout: 15_000},
        {Tesla.Middleware.JSON, decode_content_types: ["application/json"]}
      ])

    case Tesla.post(client, url, body,
           headers: headers,
           opts: [adapter: [recv_timeout: 15_000, connect_timeout: 5_000]]
         ) do
      {:ok, %Tesla.Env{status: status, body: body, headers: response_headers}} ->
        {:ok, status, body, response_headers}

      {:error, _} ->
        {:error, :connection_failed}
    end
  end
end
