defmodule FormDelegate.Jobs.UserConfirmationEmail do
  use Oban.Worker, queue: :mailer

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.MailService
  alias FormDelegateWeb.Mailers.UserConfirmationMailer

  require Logger

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"user_id" => user_id}} = job) do
    %User{} =
      user =
      user_id
      |> Accounts.get_user!()

    Logger.info("FD: Sending user confirmation email to user ID #{user.id}")

    user
    |> UserConfirmationMailer.user_confirmation_email()
    |> MailService.deliver_job(job)
  end
end
