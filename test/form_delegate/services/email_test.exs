defmodule FormDelegate.EmailTest do
  use ExUnit.Case, async: true

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Submissions.Submission

  test "send_email/2" do
    user = %User{
      email: "sales@company.com",
      name: "Sales Team"
    }

    form = %Form{
      form: "Sales Form",
      user: user,
      verified: true
    }

    submission = %Submission{
      content: "Are there any pricing discounts for schools?",
      user: user,
      form: form,
      sender: "Sam",
      unknown_fields: %{}
    }

    email = FormDelegate.Services.Email.send_email(user, submission)

    assert email.to == [nil: user.email]
    assert email.from == {"Form Delegate", "no-reply@formdelegate.com"}

    assert email.html_body =~
             "<td align=\"left\">\nAre there any pricing discounts for schools?"

    assert email.text_body =~ "Are there any pricing discounts for schools?"
  end
end
