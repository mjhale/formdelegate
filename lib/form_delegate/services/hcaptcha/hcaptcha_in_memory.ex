defmodule FormDelegate.Services.Hcaptcha.InMemory do
  alias FormDelegate.Services.Hcaptcha

  @behaviour Hcaptcha

  @impl Hcaptcha
  def verify_token(token) do
    case token do
      # Hcaptcha mock captcha response
      "10000000-aaaa-bbbb-cccc-000000000001" ->
        {:ok, %{body: %{success: "true"}}}

      _ ->
        {:error, :invalid_or_expired_captcha}
    end
  end
end
