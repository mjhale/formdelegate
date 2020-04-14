defmodule FormDelegate.Services.Akismet do
  alias FormDelegate.Messages.Message

  @callback is_spam?(String.t(), Plug.Conn.t(), %Message{}) ::
              {:ok, boolean()} | {:error, String.t()}

  @callback verify_key(String.t()) :: {:ok, String.t()} | {:error, String.t()}
end
