defmodule FormDelegate.SubmissionQueueJob do
  @behaviour Rihanna.Job

  alias FormDelegate.Forms.Form
  alias FormDelegate.Submissions.Submission
  alias FormDelegate.Services.{Email, Ifttt, Zapier}

  require Logger

  def perform([%Submission{form: %Form{} = form} = submission]) do
    Logger.info("FD: Integration jobs running for #{submission.id}")
    run_integrations(form, submission)
  end

  defp run_integrations(%Form{} = form, %Submission{} = submission) do
    Enum.each(form.form_integrations, fn form_integration ->
      if form_integration.enabled do
        case form_integration.integration.type do
          "E-mail" ->
            Logger.info("FD: Email job running for #{submission.id}")
            Task.start_link(fn -> Email.send_email(submission, "test@test.com") end)

          "Ifttt" ->
            Logger.info("FD: Queue job running for Ifttt...")
            Task.start_link(fn -> Ifttt.send_submission(submission, form) end)

          "Zapier" ->
            Logger.info("FD: Queue job running for Zapier...")
            Task.start_link(fn -> Zapier.send_submission(submission, form) end)

          _ ->
            Logger.error("FD: Integration jobs error for #{submission.id}")
            {:error, "Unknown integration type"}
        end
      end
    end)
  end
end
