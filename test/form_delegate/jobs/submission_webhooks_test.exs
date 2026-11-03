defmodule FormDelegate.Jobs.SubmissionWebhooksTest do
  use FormDelegate.DataCase
  import FormDelegate.Factory
  alias FormDelegate.Integrations.WebhookIntegration
  alias FormDelegate.Jobs.SubmissionIntegrations
  alias FormDelegate.Submissions.{Delivery, Moderation}

  defmodule EmailHTTP do
    def post(_url, _headers, _body) do
      send(Application.fetch_env!(:form_delegate, :webhook_test_owner), :email_delivered)
      {:ok, 200, %{}}
    end
  end

  setup do
    FormDelegate.WebhookTestSetup.install()
    form = insert(:form)

    integration =
      Repo.insert!(
        %WebhookIntegration{
          form_id: form.id,
          integration_type: :webhook,
          enabled: true,
          url: "https://hooks.vendor.com/event",
          signing_secret: String.duplicate("s", 32)
        },
        log: false
      )

    submission = insert(:submission, form: form, moderation_status: :accepted)

    {:ok,
     integration: integration,
     submission: submission,
     job: %Oban.Job{args: %{"submission_id" => submission.id}}}
  end

  test "failed webhook retries, writes receipts, and never repeats known success", %{
    job: job,
    submission: submission
  } do
    Application.put_env(:form_delegate, :webhook_test_response, {:ok, 503})
    assert {:error, {:provider_delivery_failed, _}} = SubmissionIntegrations.perform(job)
    assert_receive {:webhook_request, _, _, _}
    receipt = Repo.get_by!(Delivery, submission_id: submission.id)
    assert receipt.attempts == 1 and receipt.delivered_at == nil
    assert receipt.last_error == "provider_delivery_failed"
    Application.put_env(:form_delegate, :webhook_test_response, {:ok, 204})
    assert :ok = SubmissionIntegrations.perform(job)
    assert_receive {:webhook_request, _, _, _}
    assert :ok = SubmissionIntegrations.perform(job)
    refute_receive {:webhook_request, _, _, _}
    receipt = Repo.reload!(receipt)
    assert receipt.attempts == 2 and not is_nil(receipt.delivered_at)
    assert receipt.last_error == nil
  end

  test "email continues alongside a failing webhook and its success is not replayed", %{
    job: job,
    submission: submission
  } do
    previous = Application.fetch_env(:form_delegate, :email_provider_http_client)
    Application.put_env(:form_delegate, :email_provider_http_client, EmailHTTP)

    on_exit(fn ->
      case previous do
        {:ok, value} -> Application.put_env(:form_delegate, :email_provider_http_client, value)
        :error -> Application.delete_env(:form_delegate, :email_provider_http_client)
      end
    end)

    email =
      Repo.insert!(
        %FormDelegate.Integrations.EmailIntegration{
          form_id: submission.form_id,
          integration_type: :email,
          enabled: true,
          email_provider: :postmark,
          email_provider_status: :verified,
          email_provider_config: %{"from_address" => "sender@vendor.com"},
          email_provider_secrets: %{"server_token" => "synthetic"}
        },
        log: false
      )

    insert(:email_integration_recipient,
      form_integration_id: email.id,
      type: "to",
      email: "receiver@vendor.com"
    )

    Application.put_env(:form_delegate, :webhook_test_response, {:ok, 503})
    assert {:error, _} = SubmissionIntegrations.perform(job)
    assert_receive :email_delivered
    assert_receive {:webhook_request, _, _, _}
    Application.put_env(:form_delegate, :webhook_test_response, {:ok, 204})
    assert :ok = SubmissionIntegrations.perform(job)
    assert_receive {:webhook_request, _, _, _}
    refute_receive :email_delivered
  end

  test "moderation holds delivery and approval releases unfinished delivery", %{
    job: job,
    submission: submission
  } do
    for status <- [:pending, :review, :spam] do
      submission |> Ecto.Changeset.change(moderation_status: status) |> Repo.update!()
      assert :ok = SubmissionIntegrations.perform(job)
      refute_receive {:webhook_request, _, _, _}
    end

    assert Repo.aggregate(Delivery, :count) == 0
    assert {:ok, _} = Moderation.review(submission, :approved, submission.form.user.id)
    assert_receive {:webhook_request, _, _, _}
    assert :ok = SubmissionIntegrations.perform(job)
    refute_receive {:webhook_request, _, _, _}
  end

  test "disabled, removed and DNS-rebound endpoints are not contacted", %{
    job: job,
    integration: integration
  } do
    integration |> Ecto.Changeset.change(enabled: false) |> Repo.update!(log: false)
    assert :ok = SubmissionIntegrations.perform(job)
    refute_receive {:webhook_request, _, _, _}
    Repo.reload!(integration) |> Ecto.Changeset.change(enabled: true) |> Repo.update!(log: false)

    Application.put_env(
      :form_delegate,
      :webhook_test_addresses,
      {:ok, [{93, 184, 215, 14}, {169, 254, 169, 254}]}
    )

    assert {:error, _} = SubmissionIntegrations.perform(job)
    refute_receive {:webhook_request, _, _, _}
    Repo.delete!(integration, log: false)
    assert :ok = SubmissionIntegrations.perform(job)
    refute_receive {:webhook_request, _, _, _}
  end
end
