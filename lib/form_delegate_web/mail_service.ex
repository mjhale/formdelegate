defmodule FormDelegateWeb.MailService do
  use Bamboo.Mailer, otp_app: :form_delegate
  require Logger

  def deliver_job(email, %Oban.Job{id: id} = job) do
    # A fresh job represents a new explicit send attempt. Retries keep its key.
    email = Bamboo.Email.put_private(email, :resend_key, "platform/#{job.worker}/#{id}")

    case deliver_email(email) do
      {:ok, _, %{provider: :resend, id: message_id}} ->
        Logger.info("FD: Resend accepted email job_id=#{id} email_id=#{message_id}")
        :ok

      {:ok, _, _} ->
        :ok

      {:error, {:permanent, reason}} ->
        {:cancel, reason}

      {:error, {:retryable, reason}} ->
        {:error, reason}

      {:error, _} ->
        {:error, :mail_delivery_failed}
    end
  end

  # Bamboo debug logging inspects the full email, including auth links. Keep
  # Resend production sends out of that logging path.
  defp deliver_email(email) do
    config = Application.fetch_env!(:form_delegate, __MODULE__) |> Map.new()

    if config.adapter == FormDelegateWeb.ResendAdapter do
      case FormDelegateWeb.ResendAdapter.deliver(email, config) do
        {:ok, response} -> {:ok, email, response}
        error -> error
      end
    else
      deliver_now(email, response: true)
    end
  end
end
