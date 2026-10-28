defmodule FormDelegate.Jobs.SubmissionIntegrationsTest do
  use FormDelegate.DataCase
  import FormDelegate.Factory
  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Jobs.SubmissionIntegrations
  alias FormDelegate.{Repo, Submissions}
  alias FormDelegate.Submissions.{Delivery, Moderation}

  defmodule LocalHTTP do
    def post(_url, _headers, body) do
      send(self(), {:attempt, body["From"]})

      if (body["From"] == "second@example.test" and Process.get(:fail_second, false)) or
           body["From"] == Process.get(:fail_sender),
         do: {:error, :synthetic_failure},
         else: {:ok, 200, %{}}
    end
  end

  setup do
    previous = Application.get_env(:form_delegate, :email_provider_http_client)
    Application.put_env(:form_delegate, :email_provider_http_client, LocalHTTP)

    on_exit(fn ->
      if previous,
        do: Application.put_env(:form_delegate, :email_provider_http_client, previous),
        else: Application.delete_env(:form_delegate, :email_provider_http_client)
    end)

    form = insert(:form)

    for {id, sender} <- [
          {"00000000-0000-4000-8000-000000000001", "first@example.test"},
          {"00000000-0000-4000-8000-000000000002", "second@example.test"}
        ] do
      integration =
        Repo.insert!(%EmailIntegration{
          id: id,
          form_id: form.id,
          enabled: true,
          integration_type: :email,
          email_provider: :postmark,
          email_provider_status: :verified,
          email_provider_config: %{"from_address" => sender},
          email_provider_secrets: %{"server_token" => "synthetic"}
        })

      insert(:email_integration_recipient,
        form_integration_id: integration.id,
        email: "synthetic@example.test",
        type: "to"
      )
    end

    s =
      insert(:submission,
        form: form,
        moderation_status: :accepted,
        integrations_enqueued_at: DateTime.utc_now()
      )

    {:ok, submission: s, job: %Oban.Job{args: %{"submission_id" => s.id}}}
  end

  test "returns a retryable error and retries only failed integrations", %{
    job: job,
    submission: s
  } do
    Process.put(:fail_second, true)
    assert {:error, {:provider_delivery_failed, _}} = SubmissionIntegrations.perform(job)
    assert_receive {:attempt, "first@example.test"}
    assert_receive {:attempt, "second@example.test"}
    Process.put(:fail_second, false)
    assert :ok = SubmissionIntegrations.perform(job)
    refute_receive {:attempt, "first@example.test"}
    assert_receive {:attempt, "second@example.test"}
    assert :ok = SubmissionIntegrations.perform(job)
    refute_receive {:attempt, _}

    receipts =
      Repo.all(
        from d in Delivery, where: d.submission_id == ^s.id, order_by: d.form_integration_id
      )

    assert Enum.map(receipts, & &1.attempts) == [1, 2]
    assert Enum.all?(receipts, & &1.delivered_at)
    assert Enum.all?(receipts, &is_nil(&1.last_error))
  end

  test "marking a failed delivery as spam prevents retry and approval resumes only unfinished work",
       %{job: job, submission: s} do
    Process.put(:fail_second, true)
    assert {:error, _} = SubmissionIntegrations.perform(job)
    assert_receive {:attempt, "first@example.test"}
    assert_receive {:attempt, "second@example.test"}
    user_id = s.form.user.id
    assert {:ok, held} = Moderation.review(Submissions.get_submission!(s.id), :spam, user_id)
    assert :ok = SubmissionIntegrations.perform(job)
    refute_receive {:attempt, _}
    assert is_nil(Repo.reload!(s).integrations_enqueued_at)
    Process.put(:fail_second, false)
    assert {:ok, _} = Moderation.review(held, :approved, user_id)
    assert_receive {:attempt, "second@example.test"}
    refute_receive {:attempt, "first@example.test"}
  end

  test "a failing first integration does not prevent delivery to later integrations", %{job: job} do
    Process.put(:fail_sender, "first@example.test")
    assert {:error, _} = SubmissionIntegrations.perform(job)
    assert_receive {:attempt, "first@example.test"}
    assert_receive {:attempt, "second@example.test"}
    Process.delete(:fail_sender)
    assert :ok = SubmissionIntegrations.perform(job)
    assert_receive {:attempt, "first@example.test"}
    refute_receive {:attempt, "second@example.test"}
  end

  test "pending and review submissions never reach a provider", %{job: job, submission: s} do
    for status <- [:pending, :review, :spam] do
      s |> Ecto.Changeset.change(moderation_status: status) |> Repo.update!()
      assert :ok = SubmissionIntegrations.perform(job)
      refute_receive {:attempt, _}
    end

    assert Repo.aggregate(Delivery, :count) == 0
  end
end
