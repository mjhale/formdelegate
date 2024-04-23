defmodule FormDelegateWeb.Mailers.NewSubmissionMailer do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView
  import FormDelegateWeb.Mailers.BaseEmail, only: [base_email: 0]

  alias FormDelegate.Submissions.Submission

  def new_submission_email(%Submission{} = submission, recipient_groups) do
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
