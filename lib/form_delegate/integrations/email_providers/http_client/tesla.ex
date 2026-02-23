defmodule FormDelegate.Integrations.EmailProviders.HTTPClient.Tesla do
  @spec get(String.t(), [{String.t(), String.t()}]) ::
          {:ok, integer(), any()} | {:error, String.t()}
  def get(url, headers) do
    case Tesla.get(client(), url, headers: headers) do
      {:ok, %Tesla.Env{status: status, body: body}} -> {:ok, status, body}
      {:error, reason} -> {:error, "http request failed: #{inspect(reason)}"}
    end
  end

  defp client do
    Tesla.client([
      {Tesla.Middleware.JSON, decode_content_types: ["application/json"]}
    ])
  end
end
