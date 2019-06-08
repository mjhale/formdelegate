defmodule FormDelegateWeb.Services.Email do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView

  alias FormDelegate.Accounts.User
  alias FormDelegate.Mailer
  alias FormDelegate.Messages.Message

  def send_email(%User{} = user, %Message{} = message) do
    new_email_message(user, message)
    |> Mailer.deliver_later()
  end

  defp new_email_message(%User{} = user, %Message{} = message) do
    new_email(to: user.email)
    |> subject("New Message")
    |> from({"Form Delegate", "no-reply@formdelegate.com"})
    |> render(:new_message, user: user, message: message)
  end
end
