defmodule FormDelegate.Jobs.UserConfirmationEmail do
  @moduledoc "Delivers one pending confirmation email per account, skipping verified users."

  # A retrying job blocks resends via uniqueness, so give up within minutes rather than
  # Oban's default 20 attempts (~8 days of backoff); the user can then request again.
  use Oban.Worker,
    queue: :mailer,
    max_attempts: 5,
    unique: [period: :infinity, states: :incomplete, fields: [:worker, :args], keys: [:user_id]]

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.Mailers.UserConfirmationMailer
  alias FormDelegateWeb.MailService

  require Logger

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"user_id" => user_id}} = job) do
    %User{} =
      user =
      user_id
      |> Accounts.get_user!()

    if user.confirmed_at do
      :ok
    else
      deliver(user, job)
    end
  end

  defp deliver(user, job) do
    Logger.info("FD: Sending user confirmation email to user ID #{user.id}")

    user
    |> UserConfirmationMailer.user_confirmation_email()
    |> MailService.deliver_job(job)
  end
end
