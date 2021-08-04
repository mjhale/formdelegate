defmodule FormDelegate.SubmissionQueueJob do
  @behaviour Rihanna.Job

  alias FormDelegate.Forms.Form
  alias FormDelegate.Submissions.Submission
  alias FormDelegateWeb.Mailers.NewSubmissionMailer

  require Logger

  def perform([%Submission{form: %Form{} = form} = submission]) do
    Logger.info("FD: Integration jobs running for #{submission.id}")
    run_integrations(form, submission)
  end

  defp run_integrations(%Form{} = form, %Submission{} = submission) do
    Enum.each(form.email_integrations, fn email_integration ->
      if email_integration.enabled do
        Logger.info("FD: Form email job running for #{submission.id}")

        NewSubmissionMailer.send_new_submission_email(
          submission,
          email_integration.email_integration_recipients
        )
      end
    end)
  end
end
