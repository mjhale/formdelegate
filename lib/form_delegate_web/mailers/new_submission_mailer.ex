defmodule FormDelegateWeb.Mailers.NewSubmissionMailer do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView
  import FormDelegateWeb.Mailers.BaseEmail, only: [base_email: 0]

  alias FormDelegate.Submissions.Submission

  def send_new_submission_email(%Submission{} = submission, recipients) do
    recipient_groups =
      Enum.group_by(recipients, &Map.get(&1, :type), fn recipient ->
        {recipient.name, recipient.email}
      end)

    Rihanna.enqueue(Mailers.EnqueueEmail, new_submission_email(submission, recipient_groups))
  end

  defp new_submission_email(%Submission{} = submission, recipient_groups) do
    base_email()
    |> to(Map.fetch!(recipient_groups, "to"))
    |> cc(Map.get(recipient_groups, "cc"))
    |> bcc(Map.get(recipient_groups, "bcc"))
    |> subject("New Form Submission")
    |> assign(:submission_frontend_url, "#{frontend_url()}/submissions/#{submission.id}")
    |> assign(:submission, submission)
    |> assign(:form, submission.form)
    |> render(:new_submission)
  end

  defp frontend_url do
    Application.get_env(:form_delegate, :frontend_url)
  end
end
