defmodule FormDelegate.Services.Hcaptcha.Tesla do
  alias FormDelegate.Services.Hcaptcha

  @behaviour Hcaptcha

  use Tesla, only: [:post], docs: false

  plug(Tesla.Middleware.FormUrlencoded)
  plug(Tesla.Middleware.JSON)

  plug(Tesla.Middleware.Headers, [
    {"user-agent", "Form Delegate"}
  ])

  require Logger

  @impl Hcaptcha
  def verify_token(token) do
    request_body = %{remoteip: nil, response: token, secret: hcaptcha_secret_api_key()}

    case post("https://hcaptcha.com/siteverify", request_body) do
      {:ok, %Tesla.Env{status: 200, body: %{"success" => true} = body}} ->
        {:ok, body}

      _response ->
        Logger.error("FD Registration: Invalid CAPTCHA challenge for request token #{token}")
        {:error, :invalid_or_expired_captcha}
    end
  end

  defp hcaptcha_secret_api_key do
    Application.fetch_env!(:form_delegate, :hcaptcha_secret_api_key)
  end
end
