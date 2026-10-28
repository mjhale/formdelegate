defmodule FormDelegate.Jobs.SubmissionIntegrations do
  @moduledoc "Deliver each integration with durable receipts and retryable failures."
  use Oban.Worker, queue: :submission_integrations
  import Ecto.Query
  alias Ecto.Changeset
  alias FormDelegate.Integrations.EmailDispatcher
  alias FormDelegate.{Repo, Submissions}
  alias FormDelegate.Submissions.{Delivery, Moderation, Submission}
  alias FormDelegateWeb.Mailers.NewSubmissionMailer
  require Logger

  @job_timeout_ms 120_000

  @impl Oban.Worker
  def timeout(_job), do: @job_timeout_ms

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"submission_id" => submission_id}}) do
    case Moderation.prepare_delivery(submission_id) do
      {:ok, {:deliver, submission}} ->
        deliver_integrations(submission)

      {:ok, :held} ->
        :ok

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp deliver_integrations(submission) do
    submission.form.email_integrations
    |> Enum.filter(& &1.enabled)
    |> Enum.sort_by(& &1.id)
    |> Enum.reduce_while(:ok, fn integration, result ->
      delivery_result(deliver_once(submission.id, integration), result)
    end)
  end

  defp delivery_result(:ok, result), do: {:cont, result}
  defp delivery_result(:held, _result), do: {:halt, :ok}
  defp delivery_result({:error, _} = error, _result), do: {:cont, error}

  defp deliver_once(submission_id, integration) do
    # Serialize each attempt with owner moderation and other workers. Successful
    # integrations commit independently, so a later failure does not replay them.
    # A provider success followed by a DB/process crash can still be ambiguous;
    # exactly-once external delivery requires provider idempotency support.
    Repo.transaction(
      fn ->
        submission =
          Repo.one!(from s in Submission, where: s.id == ^submission_id, lock: "FOR UPDATE")

        if Moderation.delivery_allowed?(submission) do
          deliver_unless_completed(submission_id, integration)
        else
          submission |> Changeset.change(integrations_enqueued_at: nil) |> Repo.update!()
          :held
        end
      end,
      # Provider calls must not outlive the connection checkout and then lose a
      # successful receipt. Oban bounds the whole job before this deadline.
      timeout: @job_timeout_ms + 30_000
    )
    |> case do
      {:ok, result} -> result
      {:error, reason} -> {:error, reason}
    end
  end

  defp deliver_unless_completed(submission_id, integration) do
    receipt =
      Repo.get_by(Delivery, submission_id: submission_id, form_integration_id: integration.id) ||
        Repo.insert!(%Delivery{submission_id: submission_id, form_integration_id: integration.id})

    if receipt.delivered_at,
      do: :ok,
      else: attempt_delivery(Submissions.get_submission!(submission_id), integration, receipt)
  end

  defp attempt_delivery(submission, integration, receipt) do
    recipients =
      Enum.group_by(integration.email_integration_recipients, & &1.type, &{&1.name, &1.email})

    email = NewSubmissionMailer.new_submission_email(submission, recipients)

    case EmailDispatcher.deliver_submission_email(integration, email) do
      {:ok, _result} ->
        receipt
        |> Changeset.change(
          attempts: receipt.attempts + 1,
          delivered_at: DateTime.utc_now(),
          last_error: nil
        )
        |> Repo.update!()

        :ok

      {:error, _reason} ->
        receipt
        |> Changeset.change(
          attempts: receipt.attempts + 1,
          last_error: "provider_delivery_failed"
        )
        |> Repo.update!()

        Logger.warning(
          "FD: Email delivery failed integration_id=#{integration.id}; retry required"
        )

        {:error, {:provider_delivery_failed, integration.id}}
    end
  end
end
