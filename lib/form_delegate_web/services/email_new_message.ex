defmodule FormDelegateWeb.Services.EmailNewMessage do
  alias FormDelegateWeb.Emails
  alias FormDelegate.Mailer

  def send_email(user, integration, message) do
    new_message_email(user, integration, message) |> Mailer.deliver_later
  end

  defp new_message_email(user, integration, message) do
    Emails.new_message(user, integration, message)
  end
end
