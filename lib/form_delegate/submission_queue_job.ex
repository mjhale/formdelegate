defmodule FormDelegate.SubmissionQueueJob do
  @behaviour Rihanna.Job

  alias FormDelegate.Forms.Form
  alias FormDelegate.Messages.Message
  alias FormDelegateWeb.Services.{Email, Ifttt, Zapier}

  def perform([%Form{} = form, %Message{} = message]) do
    success? = run_integrations(form, message)

    if success? do
      :ok
    else
      {:error, :failed}
    end
  end

  defp run_integrations(%Form{} = form, %Message{} = message) do
    Enum.each(form.form_integrations, fn form_integration ->
      if form_integration.enabled do
        case form_integration.integration.type do
          "E-mail" ->
            Task.start_link(fn -> Email.send_email(form.user, message) end)

          "Ifttt" ->
            Task.start_link(fn -> Ifttt.send_request(form.user, message) end)

          "Zapier" ->
            Task.start_link(fn -> Zapier.send_request(form.user, message) end)

          _ ->
            {:error, "Unknown integration type"}
        end
      end
    end)
  end
end
