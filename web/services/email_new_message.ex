defmodule FormDelegate.Services.EmailNewMessage do
  alias FormDelegate.Emails
  alias FormDelegate.Mailer

  def send_email(account, integration, message) do
    new_message_email(account, integration, message) |> Mailer.deliver_later
  end

  defp new_message_email(account, integration, message) do
    Emails.new_message(account, integration, message)
  end
end
