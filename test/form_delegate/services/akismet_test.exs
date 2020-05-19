defmodule FormDelegate.AkismetTest do
  use ExUnit.Case, async: true

  alias FormDelegate.Submissions.Submission

  describe "is_spam?/3" do
    test "Responds with true when simulating a positive spam response" do
      submission = %Submission{
        sender: "akismet-guaranteed-spam@example.com"
      }

      assert {:ok, true} = akismet_api().is_spam?("2525a0331863", submission)
    end

    test "Responds with error when provided an invalid API key" do
      submission = %Submission{}

      assert {:error, %Tesla.Env{body: "invalid"}} = akismet_api().is_spam?("invalid", submission)
    end
  end

  defp akismet_api do
    Application.get_env(:form_delegate, :akismet_api)
  end
end
