defmodule FormDelegateWeb.Mailers.NewSubmissionMailerTest do
  use ExUnit.Case, async: true

  alias FormDelegate.Forms.Form
  alias FormDelegate.Submissions.Submission
  alias FormDelegateWeb.Mailers.NewSubmissionMailer

  test "renders flat submission values unchanged" do
    email =
      build_submission(
        sender: "Ada Lovelace",
        body: "Please help with my account.",
        fields: %{"message" => "Please help with my account."}
      )
      |> NewSubmissionMailer.new_submission_email(recipient_groups())

    assert email.html_body =~ "Please help with my account."
    assert email.text_body =~ "Sender: Ada Lovelace"
    assert email.text_body =~ "Body: Please help with my account."
    assert email.text_body =~ "message: Please help with my account."
  end

  test "safely renders structured and unsupported submission values" do
    email =
      build_submission(
        sender: %{"name" => "Ada Lovelace"},
        body: %{"markup" => "<script>alert('body')</script>", "topic" => "billing"},
        fields: %{
          "metadata" => %{
            "markup" => "<script>alert('field')</script>",
            "priority" => true
          },
          "tags" => ["billing", "urgent"],
          "unsupported" => self(),
          "unsupported_nested" => %{"pid" => self()}
        }
      )
      |> NewSubmissionMailer.new_submission_email(recipient_groups())

    refute email.html_body =~ "<script>alert"
    assert email.html_body =~ "&lt;script&gt;alert"
    assert email.html_body =~ "[unsupported value]"

    assert email.text_body =~ ~s(Sender: {"name":"Ada Lovelace"})
    assert email.text_body =~ ~s("topic":"billing")
    assert email.text_body =~ ~s("priority":true)
    assert email.text_body =~ ~s(tags: ["billing","urgent"])
    assert email.text_body =~ "<script>alert('field')</script>"
    assert email.text_body =~ "unsupported: [unsupported value]"
    assert email.text_body =~ "unsupported_nested: [unsupported value]"
  end

  defp build_submission(attrs) do
    struct!(
      %Submission{
        id: Ecto.UUID.generate(),
        form: %Form{name: "Support"}
      },
      attrs
    )
  end

  defp recipient_groups do
    %{"to" => [{"Support", "support@example.com"}]}
  end
end
