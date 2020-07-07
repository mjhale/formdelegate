defmodule FormDelegate.EmailTest do
  use ExUnit.Case, async: true

  alias FormDelegate.Accounts.User
  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.{EmailIntegration, EmailIntegrationRecipient, Integration}
  alias FormDelegate.Submissions.Submission

  # @TODO: Refactor test with improved data creation
  test "send_email/2" do
    user = %User{
      email: "sales@company.com",
      name: "Sales Team"
    }

    email_integration = %Integration{
      id: 1,
      name: "E-mail",
      type_code: "email"
    }

    form = %Form{
      form: "Sales Form",
      user: user,
      form_integrations: [
        %EmailIntegration{
          email_api_key: nil,
          email_from_address: nil,
          email_integration_recipients: [
            %EmailIntegrationRecipient{
              name: "Sales Team",
              email: "sales@company.com",
              type: "to"
            }
          ],
          enabled: true,
          integration: email_integration
        }
      ]
    }

    submission = %Submission{
      body: "Are there any pricing discounts for schools?",
      fields: %{
        message: "Are there any pricing discounts for schools?",
        name: "Sam"
      },
      form: form,
      sender: "Sam"
    }

    email =
      FormDelegate.Services.Email.send_email(
        submission,
        List.first(form.form_integrations).email_integration_recipients
      )

    assert email.to == [{"Sales Team", "sales@company.com"}]
    assert email.from == {"Form Delegate", "no-reply@formdelegate.com"}

    assert email.html_body =~
             "<td align=\"left\">\nAre there any pricing discounts for schools?"

    assert email.text_body =~ "Are there any pricing discounts for schools?"
  end
end
