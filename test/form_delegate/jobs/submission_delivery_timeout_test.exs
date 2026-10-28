defmodule FormDelegate.Jobs.SubmissionDeliveryTimeoutTest do
  use ExUnit.Case
  import FormDelegate.Factory

  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Jobs.SubmissionIntegrations
  alias FormDelegate.Repo
  alias FormDelegate.Submissions.Delivery

  defmodule SlowProvider do
    def post(_url, _headers, _body) do
      Process.sleep(16_000)
      send(self(), :provider_accepted)
      {:ok, 200, %{}}
    end
  end

  @tag timeout: 60_000
  test "a successful slow provider commits its receipt and is not retried" do
    # A real pool is necessary: the SQL sandbox's outer transaction can mask the
    # ordinary DBConnection checkout timeout during a provider request.
    config =
      Repo.config() |> Keyword.merge(name: nil, pool: DBConnection.ConnectionPool, pool_size: 1)

    {:ok, repo} = Repo.start_link(config)
    previous_repo = Repo.put_dynamic_repo(repo)
    previous_client = Application.fetch_env(:form_delegate, :email_provider_http_client)
    Application.put_env(:form_delegate, :email_provider_http_client, SlowProvider)

    form = insert(:form)

    try do
      integration =
        Repo.insert!(%EmailIntegration{
          form_id: form.id,
          enabled: true,
          integration_type: :email,
          email_provider: :postmark,
          email_provider_status: :verified,
          email_provider_config: %{"from_address" => "sender@example.test"},
          email_provider_secrets: %{"server_token" => "synthetic"}
        })

      insert(:email_integration_recipient,
        form_integration_id: integration.id,
        email: "owner@example.test",
        type: "to"
      )

      submission =
        insert(:submission,
          form: form,
          moderation_status: :accepted,
          integrations_enqueued_at: DateTime.utc_now()
        )

      job = %Oban.Job{args: %{"submission_id" => submission.id}}

      assert SubmissionIntegrations.timeout(job) == 120_000

      assert :ok = SubmissionIntegrations.perform(job)
      assert_receive :provider_accepted

      receipt =
        Repo.get_by!(Delivery, submission_id: submission.id, form_integration_id: integration.id)

      assert receipt.delivered_at
      assert receipt.attempts == 1
      assert :ok = SubmissionIntegrations.perform(job)
      refute_receive :provider_accepted
    after
      # Only synthetic rows from this test are removed from its dedicated DB.
      Repo.delete!(form)
      Repo.delete!(form.user)
      Repo.delete!(form.team)
      Repo.put_dynamic_repo(previous_repo)
      Supervisor.stop(repo)

      case previous_client do
        {:ok, client} -> Application.put_env(:form_delegate, :email_provider_http_client, client)
        :error -> Application.delete_env(:form_delegate, :email_provider_http_client)
      end
    end
  end
end
