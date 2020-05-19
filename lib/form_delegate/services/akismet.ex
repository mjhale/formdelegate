defmodule FormDelegate.Services.Akismet do
  alias FormDelegate.Submissions.Submission

  @callback is_spam?(String.t(), %Submission{}) ::
              {:ok, boolean()} | {:error, String.t()}

  @callback submit_ham(String.t(), %Submission{}) ::
              {:ok} | {:error, String.t()}

  @callback submit_spam(String.t(), %Submission{}) ::
              {:ok} | {:error, String.t()}

  @callback verify_key(String.t()) :: {:ok, String.t()} | {:error, String.t()}
end
