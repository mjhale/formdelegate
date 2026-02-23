defmodule FormDelegate.Integrations.EmailProvider do
  @callback verify_credentials(map(), map()) :: :ok | {:error, String.t()}
end
