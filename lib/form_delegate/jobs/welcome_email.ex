defmodule FormDelegate.Jobs.WelcomeEmail do
  use Oban.Worker, queue: :mailer

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.MailService
  alias FormDelegateWeb.Mailers.UserWelcomeMailer

  require Logger

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"user_id" => user_id}} = job) do
    %User{} =
      user =
      user_id
      |> Accounts.get_user!()

    Logger.info("FD: Sending welcome email to user ID #{user.id}")

    user
    |> UserWelcomeMailer.user_welcome_email()
    |> MailService.deliver_job(job)
  end
end
