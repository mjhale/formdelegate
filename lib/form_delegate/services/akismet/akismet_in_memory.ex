defmodule FormDelegate.Services.Akismet.InMemory do
  alias FormDelegate.Submissions.Submission
  alias FormDelegate.Services.Akismet

  @behaviour Akismet

  @impl Akismet
  def is_spam?(api_key, %Submission{sender: sender}) do
    cond do
      api_key == "invalid" ->
        {:error, %Tesla.Env{body: "invalid"}}

      sender == "akismet-guaranteed-spam@example.com" ->
        {:ok, true}

      true ->
        {:ok, false}
    end
  end

  @impl Akismet
  def submit_ham(_api_key, _submission = %Submission{}) do
    {:ok}
  end

  @impl Akismet
  def submit_spam(_api_key, _submission = %Submission{}) do
    {:ok}
  end

  @impl Akismet
  def verify_key(api_key) do
    case api_key do
      "valid" ->
        {:ok, "valid"}

      _ ->
        {:error, "invalid"}
    end
  end
end
