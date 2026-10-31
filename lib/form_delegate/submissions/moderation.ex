defmodule FormDelegate.Submissions.Moderation do
  @moduledoc "Persists classification and recoverable moderation before integration delivery."
  import Ecto.Query
  alias Ecto.Changeset
  alias FormDelegate.Forms.Form
  alias FormDelegate.Jobs.SubmissionIntegrations
  alias FormDelegate.{Repo, Submissions}
  alias FormDelegate.Submissions.{SpamClassifier, Submission}

  def classify(%Submission{} = submission) do
    Repo.transaction(fn ->
      # Serialize per-form classification across app nodes, including duplicate checks.
      form = Repo.one!(from f in Form, where: f.id == ^submission.form_id, lock: "FOR UPDATE")
      current = locked_submission(submission.id)

      if current.moderation_status == :pending do
        fingerprint = SpamClassifier.fingerprint(current)

        decision =
          SpamClassifier.classify(current, signals(current, fingerprint), form.spam_filter_mode)

        current
        |> persist(decision.status, %{
          spam_assessment: decision.assessment,
          content_fingerprint: fingerprint
        })
        |> enqueue_if_allowed()
      else
        current
      end
    end)
  end

  def review(%Submission{} = submission, verdict, reviewer_id)
      when verdict in [:approved, :spam] do
    Repo.transaction(fn ->
      current = locked_submission(submission.id)

      current
      |> persist(verdict, %{reviewed_at: DateTime.utc_now(), reviewed_by_id: reviewer_id})
      |> enqueue_if_allowed()
    end)
  end

  # A held job may already have been queued before the owner marked it as spam.
  # Clear its reservation so a later approval can enqueue a replacement.
  def prepare_delivery(id) do
    Repo.transaction(fn ->
      submission = locked_submission(id)

      if delivery_allowed?(submission) do
        {:deliver, submission}
      else
        submission |> Changeset.change(integrations_enqueued_at: nil) |> Repo.update!()
        :held
      end
    end)
  end

  def delivery_allowed?(submission) do
    is_nil(submission.flagged_at) and
      submission.moderation_status in [:accepted, :approved, :unclassified]
  end

  defp locked_submission(id) do
    Repo.one!(from s in Submission, where: s.id == ^id, lock: "FOR UPDATE")
    |> Repo.preload([
      :attachments,
      :flagged_type,
      form: [:webhook_integrations, email_integrations: [:email_integration_recipients]]
    ])
  end

  defp persist(submission, status, attrs) do
    spam? = status == :spam

    flagged_type =
      if spam?, do: Submissions.get_or_create_flagged_type(%{type: "spam"}), else: nil

    submission
    |> Changeset.change(
      Map.merge(attrs, %{
        moderation_status: status,
        flagged_at:
          if(spam?, do: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second), else: nil)
      })
    )
    |> Changeset.put_assoc(:flagged_type, flagged_type)
    |> Repo.update!()
  end

  defp enqueue_if_allowed(submission) do
    if delivery_allowed?(submission) and is_nil(submission.integrations_enqueued_at) do
      case %{submission_id: submission.id, form_id: submission.form_id}
           |> SubmissionIntegrations.new()
           |> Oban.insert() do
        {:ok, _job} ->
          submission
          |> Changeset.change(integrations_enqueued_at: DateTime.utc_now())
          |> Repo.update!()

        {:error, reason} ->
          Repo.rollback(reason)
      end
    else
      submission
    end
  end

  defp signals(submission, fingerprint) do
    since = DateTime.add(DateTime.utc_now(), -600, :second)

    recent =
      from s in Submission,
        where:
          s.form_id == ^submission.form_id and s.id != ^submission.id and s.inserted_at >= ^since

    duplicates =
      Repo.aggregate(from(s in recent, where: s.content_fingerprint == ^fingerprint), :count)

    burst =
      if submission.sender_ip in [nil, ""] do
        0
      else
        minute = DateTime.add(DateTime.utc_now(), -60, :second)

        Repo.aggregate(
          from(s in recent,
            where: s.sender_ip == ^submission.sender_ip and s.inserted_at >= ^minute
          ),
          :count
        )
      end

    %{duplicates: duplicates, recent_from_ip: burst}
  end
end
