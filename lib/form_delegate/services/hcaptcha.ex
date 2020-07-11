defmodule FormDelegate.Services.Hcaptcha do
  @callback verify_token(String.t()) :: {:ok, map()} | {:error, atom()}
end
