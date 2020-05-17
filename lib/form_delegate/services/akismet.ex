defmodule FormDelegate.Services.Akismet do
  alias FormDelegate.Messages.Message

  @callback is_spam?(String.t(), %Message{}) ::
              {:ok, boolean()} | {:error, String.t()}

  @callback submit_ham(String.t(), %Message{}) ::
              {:ok} | {:error, String.t()}

  @callback submit_spam(String.t(), %Message{}) ::
              {:ok} | {:error, String.t()}

  @callback verify_key(String.t()) :: {:ok, String.t()} | {:error, String.t()}
end
