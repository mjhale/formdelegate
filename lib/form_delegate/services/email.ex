defmodule FormDelegate.Services.Email do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView

  # alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Submissions.Submission
  alias FormDelegateWeb.MailService

  def send_email(%Submission{} = submission, recipients) do
    recipient_groups =
      Enum.group_by(recipients, &Map.get(&1, :type), fn recipient ->
        {recipient.name, recipient.email}
      end)

    new_email_submission(submission, recipient_groups)
    |> MailService.deliver_later()
  end

  defp new_email_submission(%Submission{} = submission, recipient_groups) do
    new_email(to: Map.fetch!(recipient_groups, "to"))
    |> cc(Map.get(recipient_groups, "cc"))
    |> bcc(Map.get(recipient_groups, "bcc"))
    |> subject("New Form Submission")
    |> from({"Form Delegate", "no-reply@formdelegate.com"})
    |> render(:new_submission, submission: submission)
  end
end
