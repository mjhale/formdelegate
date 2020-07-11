defmodule FormDelegate.Services.Hcaptcha.Tesla do
  alias FormDelegate.Services.Hcaptcha

  @behaviour Hcaptcha
  @hcaptcha_secret_api_key System.get_env("HCAPTCHA_SECRET_API_KEY")

  use Tesla, only: [:post], docs: false

  plug(Tesla.Middleware.FormUrlencoded)
  plug(Tesla.Middleware.JSON)

  plug(Tesla.Middleware.Headers, [
    {"user-agent", "Form Delegate"}
  ])

  require Logger

  @impl Hcaptcha
  def verify_token(token) do
    request_body = %{remoteip: nil, response: token, secret: @hcaptcha_secret_api_key}

    case post("https://hcaptcha.com/siteverify", request_body) do
      {:ok, %Tesla.Env{status: 200, body: %{"success" => true} = body}} ->
        {:ok, body}

      _response ->
        Logger.error("FD Registration: Invalid CAPTCHA challenge for request token #{token}")
        {:error, :invalid_api_response}
    end
  end
end
