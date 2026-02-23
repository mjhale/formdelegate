defmodule FormDelegate.Integrations.EmailProviders.SMTPClient do
  @callback verify(%{
              required(:host) => String.t(),
              required(:port) => pos_integer(),
              required(:username) => String.t(),
              required(:password) => String.t(),
              optional(:timeout_ms) => pos_integer(),
              optional(:helo_domain) => String.t(),
              optional(:use_ssl) => boolean()
            }) :: :ok | {:error, String.t()}
end
