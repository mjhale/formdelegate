defmodule FormDelegateWeb.Emails do
  use Bamboo.Phoenix, view: FormDelegate.EmailView

  def new_message(user, integration, message) do
    new_email(to: user.email)
    |> subject("New Message")
    |> from({"Form Delegate", "no-reply@formdelegate.com"})
    |> render(:new_message,
      user: user,
      integration: integration,
      message: message
    )
  end
end
