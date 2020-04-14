defmodule FormDelegate.SubmissionQueueJob do
  @behaviour Rihanna.Job

  require Logger

  alias FormDelegate.Forms.Form
  alias FormDelegate.{Messages, Messages.Message}
  alias FormDelegate.Services.{Email, Ifttt, Zapier}

  def perform([conn, %Form{} = form, %Message{} = message]) do
    # @TODO: Allow user-specified Akismet API key
    case akismet_api().is_spam?(System.get_env("AKISMET_API_KEY"), conn, message) do
      {:ok, false} ->
        run_integrations(form, message)
        Logger.debug("FD Queue: Integrations running. No spam detected by Akismet.")

      {:ok, true} ->
        message
        |> Messages.update_message(%{spam_status: "detected"})

        Logger.debug("FD Queue: Spam detected by Akismet.")

      {:error, error} ->
        Logger.error("FD Queue: Akismet error: #{inspect(error)}")
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
            Logger.debug("FD Queue: run_integrations error")
        end
      end
    end)
  end

  defp akismet_api do
    Application.get_env(:form_delegate, :akismet_api)
  end
end
