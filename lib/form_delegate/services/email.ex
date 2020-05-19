defmodule FormDelegate.Services.Email do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView

  alias FormDelegate.Accounts.User
  alias FormDelegate.Mailer
  alias FormDelegate.Submissions.Submission

  def send_email(%User{} = user, %Submission{} = submission) do
    new_email_submission(user, submission)
    |> Mailer.deliver_later()
  end

  defp new_email_submission(%User{} = user, %Submission{} = submission) do
    new_email(to: user.email)
    |> subject("New Form Submission")
    |> from({"Form Delegate", "no-reply@formdelegate.com"})
    |> render(:new_submission, user: user, submission: submission)
  end
end
