defmodule FormDelegate.SubmissionQueueJob do
  @behaviour Rihanna.Job

  alias FormDelegate.Forms.Form
  alias FormDelegate.Submissions.Submission
  alias FormDelegate.Services.Email

  require Logger

  def perform([%Submission{form: %Form{} = form} = submission]) do
    Logger.info("FD: Integration jobs running for #{submission.id}")
    run_integrations(form, submission)
  end

  defp run_integrations(%Form{} = form, %Submission{} = submission) do
    Enum.each(form.form_integrations, fn form_integration ->
      if form_integration.enabled do
        case form_integration.integration.type_code do
          "email" ->
            Logger.info("FD: Form email job running for #{submission.id}")

            Task.start_link(fn ->
              Email.send_email(submission, form_integration.email_integration_recipients)
            end)

          _ ->
            Logger.error("FD: Form integration job error for #{submission.id}")
            {:error, "Unknown integration type"}
        end
      end
    end)
  end
end
