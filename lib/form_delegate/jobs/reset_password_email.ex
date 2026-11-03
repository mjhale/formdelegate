defmodule FormDelegate.Jobs.ResetPasswordEmail do
  use Oban.Worker, queue: :mailer

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.MailService
  alias FormDelegateWeb.Mailers.ResetPasswordRequest

  require Logger

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"user_id" => user_id}} = job) do
    %User{} =
      user =
      user_id
      |> Accounts.get_user!()

    Logger.info("FD: Sending reset password email to user ID #{user.id}")

    user
    |> ResetPasswordRequest.reset_password_request_email()
    |> MailService.deliver_job(job)
  end
end
