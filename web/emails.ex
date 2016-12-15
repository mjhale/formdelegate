defmodule FormDelegate.Emails do
  use Bamboo.Phoenix, view: FormDelegate.EmailView

  def new_message(account, integration, message) do
    new_email(to: account.email)
    |> subject("New Message")
    |> from({"Form Delegate", "no-reply@formdelegate.com"})
    |> render(:new_message,
      account: account,
      integration: integration,
      message: message
    )
  end
end
