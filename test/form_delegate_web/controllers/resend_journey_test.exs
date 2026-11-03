defmodule FormDelegateWeb.ResendJourneyTest do
  use FormDelegateWeb.ConnCase
  import Ecto.Query
  alias FormDelegate.{Accounts, Forms, Repo}
  alias FormDelegate.Integrations.EmailProviders.Resend, as: ResendProvider
  alias FormDelegate.Jobs.SubmissionIntegrations
  alias FormDelegate.Submissions.{Delivery, Moderation, Submission}
  alias FormDelegateWeb.MailService

  defmodule Transport do
    def post(_, headers, body) do
      send(self(), {:resend, headers, body})
      response = Process.get(:resend_response, {:ok, 200, %{"id" => "synthetic-email-id"}, []})
      if is_function(response, 1), do: response.(body), else: response
    end
  end

  setup do
    keys = [MailService, :resend_http_client, :frontend_url]
    previous = Enum.map(keys, &{&1, Application.fetch_env(:form_delegate, &1)})

    Application.put_env(:form_delegate, MailService,
      adapter: FormDelegateWeb.ResendAdapter,
      api_key: "platform-only-key",
      from: "Platform <hello@example.test>"
    )

    Application.put_env(:form_delegate, :resend_http_client, Transport)
    Application.put_env(:form_delegate, :frontend_url, "https://frontend.example.test")

    on_exit(fn ->
      for {key, value} <- previous do
        case value do
          {:ok, previous} -> Application.put_env(:form_delegate, key, previous)
          :error -> Application.delete_env(:form_delegate, key)
        end
      end
    end)

    :ok
  end

  test "fresh signup, confirmation, persisted Resend form, authorized submission, moderation and repeat workers",
       %{conn: conn} do
    conn = put_req_header(conn, "accept", "application/json")

    Oban.Testing.with_testing_mode(:manual, fn ->
      for run <- 1..2 do
        email = "fresh-#{run}@example.test"

        response =
          conn
          |> post("/v1/users", %{
            captcha: "10000000-aaaa-bbbb-cccc-000000000001",
            user: %{email: email, name: "Fresh User", password: "a sufficiently long password"}
          })
          |> json_response(201)

        assert %{success: 1, failure: 0} = Oban.drain_queue(queue: :mailer)
        assert_receive {:resend, platform_headers, welcome}
        assert {"authorization", "Bearer platform-only-key"} in platform_headers
        refute Map.has_key?(welcome, "template")
        assert welcome["html"] =~ "Welcome to Form Delegate"

        [confirmation_url] =
          Regex.run(
            ~r{https://frontend\.example\.test/user-confirmation\?token=[A-Za-z0-9_-]+},
            welcome["text"]
          )

        assert welcome["html"] =~ confirmation_url
        token = URI.decode_query(URI.parse(confirmation_url).query)["token"]
        conn |> get("/v1/users/confirm", %{token: token}) |> json_response(200)
        user = Accounts.get_user!(response["data"]["id"])
        assert user.confirmed_at

        team =
          Repo.get!(
            FormDelegate.Teams.Team,
            Repo.get_by!(FormDelegate.Memberships.Membership, user_id: user.id).team_id
          )

        assert {:ok, form} =
                 Forms.create_form(
                   %{
                     "name" => "Fresh form #{run}",
                     "hosts" => ["authorized.example.test"],
                     "submission_source_policy" => "restricted",
                     "spam_filter_mode" => "review_all",
                     "email_integrations" => [integration_attrs()]
                   },
                   user,
                   team
                 )

        assert_receive {:resend, verify_headers, probe}
        assert probe["to"] == ["delivered@resend.dev"]
        assert probe["text"] == "Form Delegate email integration verification."
        assert probe["html"] == "<p>Form Delegate email integration verification.</p>"
        refute Map.has_key?(probe, "template")
        assert {"authorization", "Bearer customer-only-key"} in verify_headers
        form = Forms.get_form!(form.id)
        [integration] = form.email_integrations
        assert integration.email_provider == :resend
        assert integration.email_provider_status == :verified

        rendered =
          FormDelegateWeb.FormEmailIntegrationView.render("form_email_integration.json", %{
            email_integration: integration
          })
          |> Jason.encode!()

        refute rendered =~ "customer-only-key"
        refute rendered =~ "email_provider_secrets"
        before = Repo.aggregate(Submission, :count)

        conn
        |> put_req_header("origin", "https://wrong.example.test")
        |> post("/v1/submissions/#{form.id}", %{message: "A controlled message"})
        |> json_response(403)

        assert Repo.aggregate(Submission, :count) == before

        conn
        |> put_req_header("origin", "https://authorized.example.test")
        |> post("/v1/submissions/#{form.id}", %{message: "A controlled message"})
        |> json_response(202)

        assert Repo.aggregate(Submission, :count) == before + 1
        Oban.drain_queue(queue: :default)
        submission = Repo.one!(from s in Submission, where: s.form_id == ^form.id)
        assert submission.moderation_status == :review

        assert :ok =
                 SubmissionIntegrations.perform(%Oban.Job{
                   args: %{"submission_id" => submission.id}
                 })

        refute_receive {:resend, _, _}
        assert {:ok, _} = Moderation.review(submission, :approved, user.id)
        assert %{success: 1, failure: 0} = Oban.drain_queue(queue: :submission_integrations)
        assert_receive {:resend, notification_headers, notification}
        assert {"authorization", "Bearer customer-only-key"} in notification_headers

        refute Map.has_key?(notification, "template")

        for body <- [notification["html"], notification["text"]] do
          assert body =~ form.name
          assert body =~ "A controlled message"
          assert body =~ "https://frontend.example.test/submissions/#{submission.id}"
        end

        assert :ok =
                 SubmissionIntegrations.perform(%Oban.Job{
                   args: %{"submission_id" => submission.id}
                 })

        refute_receive {:resend, _, _}
        receipt = Repo.get_by!(Delivery, submission_id: submission.id)
        assert receipt.provider_message_id == "synthetic-email-id"
        assert receipt.attempts == 1
      end
    end)
  end

  test "verification rejects invalid credentials/configuration, uses test recipient, and rolls back form creation" do
    {user, team, _} = insert_user_with_membership()
    Process.put(:resend_response, {:ok, 401, %{"message" => "customer-only-key"}, []})

    assert {:error, :bad_request, _} =
             Forms.create_form(
               %{"name" => "Invalid", "email_integrations" => [integration_attrs()]},
               user,
               team
             )

    assert Repo.aggregate(FormDelegate.Forms.Form, :count) == 0
    assert_receive {:resend, _, %{"to" => ["delivered@resend.dev"]}}

    assert {:error, reason} =
             ResendProvider.verify_credentials(
               %{"from_address" => ""},
               %{"api_key" => "key"}
             )

    assert reason =~ "missing required value"
    refute_receive {:resend, _, _}
  end

  test "transient failures return errors to Oban; changed-payload conflicts are terminal" do
    {user, team, _} = insert_user_with_membership()

    assert {:ok, form} =
             Forms.create_form(
               %{"name" => "Failures", "email_integrations" => [integration_attrs()]},
               user,
               team
             )

    assert_receive {:resend, _, _}
    submission = insert(:submission, form: form, moderation_status: :accepted)
    job = %Oban.Job{args: %{"submission_id" => submission.id}}
    Process.put(:resend_response, {:ok, 429, %{}, [{"retry-after", "700"}]})
    assert {:error, {:provider_delivery_failed, _}} = SubmissionIntegrations.perform(job)
    assert_receive {:resend, headers, original_body}

    form |> Ecto.Changeset.change(name: "Changed form") |> Repo.update!()

    Process.put(
      :resend_response,
      {:ok, 409, %{"name" => "invalid_idempotent_request", "message" => "customer-only-key"}, []}
    )

    assert :ok = SubmissionIntegrations.perform(job)
    assert_receive {:resend, ^headers, changed_body}
    refute changed_body == original_body
    assert changed_body["text"] =~ "Changed form"
    receipt = Repo.get_by!(Delivery, submission_id: submission.id)
    assert receipt.failed_at
    assert receipt.attempts == 2
    assert receipt.last_error == "provider_permanent_failure"
    assert :ok = SubmissionIntegrations.perform(job)
    refute_receive {:resend, _, _}
  end

  test "a terminal Resend failure does not prevent another integration from retrying" do
    {user, team, _} = insert_user_with_membership()

    terminal =
      put_in(
        integration_attrs(),
        ["email_provider_config", "from_address"],
        "terminal@example.test"
      )

    retryable =
      put_in(integration_attrs(), ["email_provider_config", "from_address"], "retry@example.test")

    assert {:ok, form} =
             Forms.create_form(
               %{
                 "name" => "Independent deliveries",
                 "email_integrations" => [terminal, retryable]
               },
               user,
               team
             )

    for _ <- 1..2, do: assert_receive({:resend, _, %{"to" => ["delivered@resend.dev"]}})
    submission = insert(:submission, form: form, moderation_status: :accepted)
    job = %Oban.Job{args: %{"submission_id" => submission.id}}

    retryable =
      Enum.find(
        form.email_integrations,
        &(&1.email_provider_config["from_address"] == "retry@example.test")
      )

    terminal =
      Enum.find(
        form.email_integrations,
        &(&1.email_provider_config["from_address"] == "terminal@example.test")
      )

    Process.put(:resend_response, fn body ->
      if body["from"] == "terminal@example.test",
        do: {:ok, 409, %{"name" => "invalid_idempotent_request"}, []},
        else: {:ok, 503, %{}, []}
    end)

    assert {:error, {:provider_delivery_failed, integration_id}} =
             SubmissionIntegrations.perform(job)

    assert integration_id == retryable.id
    assert_receive {:resend, _, %{"from" => "terminal@example.test"}}
    assert_receive {:resend, retry_headers, %{"from" => "retry@example.test"}}

    assert Repo.get_by!(Delivery, submission_id: submission.id, form_integration_id: terminal.id).failed_at

    Process.delete(:resend_response)
    assert :ok = SubmissionIntegrations.perform(job)
    assert_receive {:resend, ^retry_headers, %{"from" => "retry@example.test"}}
    refute_receive {:resend, _, %{"from" => "terminal@example.test"}}

    accepted =
      Repo.get_by!(Delivery, submission_id: submission.id, form_integration_id: retryable.id)

    assert accepted.delivered_at
    assert accepted.attempts == 2
    assert accepted.provider_message_id == "synthetic-email-id"
    assert :ok = SubmissionIntegrations.perform(job)
    refute_receive {:resend, _, _}
  end

  test "uses the default rendered HTML/text and customer key with to/cc/bcc, ignoring old template config" do
    {user, team, _} = insert_user_with_membership()

    attrs =
      integration_attrs()
      |> put_in(["email_provider_config", "template_id"], "unused-old-template")
      |> Map.update!("email_integration_recipients", fn recipients ->
        recipients ++
          [
            %{"type" => "cc", "email" => "copy@example.test", "name" => "Copy"},
            %{"type" => "bcc", "email" => "blind@example.test", "name" => "Blind"}
          ]
      end)

    assert {:ok, form} =
             Forms.create_form(
               %{"name" => "Support <script>unsafe</script>", "email_integrations" => [attrs]},
               user,
               team
             )

    assert_receive {:resend, headers, probe}
    assert {"authorization", "Bearer customer-only-key"} in headers
    refute Map.has_key?(probe, "template")
    assert probe["to"] == ["delivered@resend.dev"]
    refute Map.has_key?(probe, "cc")
    refute Map.has_key?(probe, "bcc")

    submission =
      insert(:submission,
        form: form,
        moderation_status: :accepted,
        sender: "Controlled sender",
        body: "Please help <script>unsafe</script>",
        fields: %{"message" => "A detailed submission", "topic" => "billing"}
      )

    assert :ok =
             SubmissionIntegrations.perform(%Oban.Job{args: %{"submission_id" => submission.id}})

    assert_receive {:resend, headers, notification}
    assert {"authorization", "Bearer customer-only-key"} in headers

    assert {"idempotency-key", "submission/#{submission.id}/#{hd(form.email_integrations).id}"} in headers

    assert notification["from"] == "customer@example.test"
    assert notification["to"] == ["Controlled Inbox <controlled@example.test>"]
    assert notification["cc"] == ["Copy <copy@example.test>"]
    assert notification["bcc"] == ["Blind <blind@example.test>"]
    assert notification["subject"] == "New Form Submission"
    refute Map.has_key?(notification, "template")
    assert notification["html"] =~ "&lt;script&gt;unsafe&lt;/script&gt;"
    refute notification["html"] =~ "<script>"
    assert notification["text"] =~ "Please help <script>unsafe</script>"
    assert notification["text"] =~ "Controlled sender"

    for body <- [notification["html"], notification["text"]] do
      assert body =~ "A detailed submission"
      assert body =~ "billing"
      assert body =~ "https://frontend.example.test/submissions/#{submission.id}"
    end
  end

  defp integration_attrs do
    %{
      "enabled" => true,
      "email_provider" => "resend",
      "email_provider_status" => "pending_verification",
      "verify_provider" => true,
      "email_provider_config" => %{
        "from_address" => "customer@example.test"
      },
      "email_provider_secrets" => %{"api_key" => "customer-only-key"},
      "email_integration_recipients" => [
        %{"type" => "to", "email" => "controlled@example.test", "name" => "Controlled Inbox"}
      ]
    }
  end
end
