defmodule FormDelegate.SubmissionQueueJob do
  @behaviour Rihanna.Job

  alias FormDelegate.Forms.Form
  alias FormDelegate.Messages.Message
  alias FormDelegate.Services.{Email, Ifttt, Zapier}

  require Logger

  def perform([%Form{} = form, %Message{} = message]) do
    Logger.info("FD: Queue job running for request...")
    run_integrations(form, message)
  end

  defp run_integrations(%Form{} = form, %Message{} = message) do
    Enum.each(form.form_integrations, fn form_integration ->
      if form_integration.enabled do
        case form_integration.integration.type do
          "E-mail" ->
            Logger.info("FD: Queue job running for email...")
            Task.start_link(fn -> Email.send_email(form.user, message) end)

          "Ifttt" ->
            Logger.info("FD: Queue job running for Ifttt...")
            Task.start_link(fn -> Ifttt.send_request(form.user, message) end)

          "Zapier" ->
            Logger.info("FD: Queue job running for Zapier...")
            Task.start_link(fn -> Zapier.send_request(form.user, message) end)

          _ ->
            Logger.error("FD: Queue job run_integrations error")
            {:error, "Unknown integration type"}
        end
      end
    end)
  end
end
