defmodule FormDelegate.SubmissionQueueJob do
  @behaviour Rihanna.Job

  alias FormDelegate.Forms.Form
  alias FormDelegate.Submissions.Submission
  alias FormDelegate.Services.{Email, Ifttt, Zapier}

  require Logger

  def perform([%Form{} = form, %Submission{} = submission]) do
    Logger.info("FD: Queue job running for submission...")
    run_integrations(form, submission)
  end

  defp run_integrations(%Form{} = form, %Submission{} = submission) do
    Enum.each(form.form_integrations, fn form_integration ->
      if form_integration.enabled do
        case form_integration.integration.type do
          "E-mail" ->
            Logger.info("FD: Queue job running for email...")
            Task.start_link(fn -> Email.send_email(form.user, submission) end)

          "Ifttt" ->
            Logger.info("FD: Queue job running for Ifttt...")
            Task.start_link(fn -> Ifttt.send_submission(form.user, submission) end)

          "Zapier" ->
            Logger.info("FD: Queue job running for Zapier...")
            Task.start_link(fn -> Zapier.send_submission(form.user, submission) end)

          _ ->
            Logger.error("FD: Queue job run_integrations error")
            {:error, "Unknown integration type"}
        end
      end
    end)
  end
end
