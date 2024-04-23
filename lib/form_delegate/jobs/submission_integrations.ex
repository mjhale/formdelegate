defmodule FormDelegate.Jobs.SubmissionIntegrations do
  use Oban.Worker, queue: :submission_integrations

  alias Bamboo.Email

  alias FormDelegate.Forms.Form
  alias FormDelegate.{Submissions, Submissions.Submission}
  alias FormDelegateWeb.MailService
  alias FormDelegateWeb.Mailers.NewSubmissionMailer

  require Logger

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"submission_id" => submission_id} = _args}) do
    Logger.info("FD: Integration jobs running for #{submission_id}")

    %Submission{form: %Form{} = form} = submission = Submissions.get_submission!(submission_id)

    # Email integrations
    Enum.each(form.email_integrations, fn email_integration ->
      if email_integration.enabled do
        Logger.info("FD: Form email job running for #{submission.id}")

        recipient_groups =
          Enum.group_by(
            email_integration.email_integration_recipients,
            &Map.get(&1, :type),
            fn recipient ->
              {recipient.name, recipient.email}
            end
          )

        {:ok, %Email{} = _email, _response} =
          submission
          |> NewSubmissionMailer.new_submission_email(recipient_groups)
          |> MailService.deliver_now(response: true)
      end
    end)

    :ok
  end
end
