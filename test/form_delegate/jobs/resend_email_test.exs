defmodule FormDelegate.Jobs.ResendEmailTest do
  use FormDelegate.DataCase
  import FormDelegate.Factory
  import ExUnit.CaptureLog

  alias FormDelegate.Jobs.{
    ResetPasswordEmail,
    TeamInvitationEmail,
    UserConfirmationEmail,
    WelcomeEmail
  }

  alias FormDelegate.{Repo, Teams.TeamInvitation}
  alias FormDelegateWeb.MailService

  defmodule Transport do
    def post(_, headers, body) do
      send(self(), {:email, headers, body})
      Process.get(:response, {:ok, 200, %{"id" => "provider-email"}, []})
    end
  end

  setup do
    previous_mailer = Application.fetch_env!(:form_delegate, MailService)
    previous_http = Application.fetch_env(:form_delegate, :resend_http_client)
    previous_url = Application.fetch_env(:form_delegate, :frontend_url)
    Application.put_env(:form_delegate, :frontend_url, "https://frontend.example.test")
    Application.put_env(:form_delegate, :resend_http_client, Transport)

    Application.put_env(:form_delegate, MailService,
      adapter: FormDelegateWeb.ResendAdapter,
      api_key: "synthetic-key",
      from: "Form Delegate <hello@mail.example.test>"
    )

    on_exit(fn ->
      Application.put_env(:form_delegate, MailService, previous_mailer)

      for {key, value} <- [resend_http_client: previous_http, frontend_url: previous_url] do
        case value do
          {:ok, previous} -> Application.put_env(:form_delegate, key, previous)
          :error -> Application.delete_env(:form_delegate, key)
        end
      end
    end)

    :ok
  end

  test "account jobs send existing rendered HTML/text with correct links and stable keys" do
    user =
      insert(:user,
        reset_password_token: "reset-secret",
        confirmation_token: "confirmation-secret",
        name: "<script>unsafe</script> & User"
      )

    previous_level = Logger.level()
    Logger.configure(level: :debug)
    on_exit(fn -> Logger.configure(level: previous_level) end)

    for {worker, id, expected_subject, expected_link} <- [
          {WelcomeEmail, 101, "Welcome to Form Delegate",
           "/user-confirmation?token=confirmation-secret"},
          {UserConfirmationEmail, 102, "Confirm Your Form Delegate Account",
           "/user-confirmation?token=confirmation-secret"},
          {ResetPasswordEmail, 103, "Password Reset Request for Form Delegate",
           "/reset?token=reset-secret"}
        ] do
      job = %Oban.Job{
        id: id,
        worker: to_string(worker),
        args: %{"user_id" => user.id},
        attempt: 1
      }

      log = capture_log([level: :debug], fn -> assert :ok = worker.perform(job) end)
      refute log =~ "confirmation-secret"
      refute log =~ "reset-secret"
      refute log =~ "synthetic-key"
      assert_receive {:email, headers, body}
      assert {"idempotency-key", "platform/#{worker}/#{id}"} in headers
      assert body["from"] == "Form Delegate <hello@mail.example.test>"
      assert body["to"] == ["#{user.name} <#{user.email}>"]
      assert body["subject"] == expected_subject
      refute Map.has_key?(body, "template")

      for content <- [body["html"], body["text"]] do
        assert content =~ "https://frontend.example.test" <> expected_link
      end

      refute body["html"] =~ "<script>"

      if worker != WelcomeEmail do
        assert body["html"] =~ "&lt;script&gt;unsafe&lt;/script&gt; &amp; User"
        assert body["text"] =~ user.name
      end

      assert :ok = worker.perform(%{job | attempt: 2})
      assert_receive {:email, retry_headers, ^body}
      assert retry_headers == headers
    end
  end

  test "transient failures use ordinary Oban errors; changed payload conflicts cancel with the same key" do
    user = insert(:user)

    job = %Oban.Job{
      id: 201,
      worker: to_string(UserConfirmationEmail),
      args: %{"user_id" => user.id},
      attempt: 1
    }

    Process.put(:response, {:ok, 429, %{}, [{"retry-after", "500"}]})
    assert {:error, :resend_unavailable} = UserConfirmationEmail.perform(job)
    assert_receive {:email, original_headers, original_body}

    user |> Ecto.Changeset.change(confirmation_token: "changed-token") |> Repo.update!()

    Process.put(
      :response,
      {:ok, 409, %{"name" => "invalid_idempotent_request", "message" => "synthetic-key"}, []}
    )

    assert {:cancel, "resend_http_409"} = UserConfirmationEmail.perform(%{job | attempt: 2})
    assert_receive {:email, ^original_headers, changed_body}
    refute changed_body == original_body
    assert changed_body["text"] =~ "changed-token"

    Process.delete(:response)
    assert :ok = UserConfirmationEmail.perform(%{job | id: 202})
    assert_receive {:email, new_headers, ^changed_body}
    refute new_headers == original_headers
  end

  test "Oban schedules a failed send with its existing finite attempt policy" do
    user = insert(:user)
    Process.put(:response, {:error, :timeout})

    Oban.Testing.with_testing_mode(:manual, fn ->
      assert {:ok, job} = %{user_id: user.id} |> WelcomeEmail.new() |> Oban.insert()
      assert %{failure: 1, success: 0} = Oban.drain_queue(queue: :mailer)
      assert_receive {:email, _, _}
      retried = Repo.get!(Oban.Job, job.id)
      assert retried.state == "retryable"
      assert retried.attempt == 1
      assert retried.max_attempts == job.max_attempts
      assert retried.max_attempts > retried.attempt
    end)
  end

  test "team invitation sends rendered links and escaped names, ignores cancelled or expired invitations" do
    {user, team, _} = insert_user_with_membership(name: "<script>Inviter</script>")
    team = team |> Ecto.Changeset.change(name: "<em>Team & Co</em>") |> Repo.update!()

    invitation =
      %TeamInvitation{}
      |> TeamInvitation.create_changeset(%{
        team_id: team.id,
        inviter_id: user.id,
        email: "invitee@example.test"
      })
      |> Repo.insert!()

    job = %Oban.Job{
      id: 301,
      worker: to_string(TeamInvitationEmail),
      args: %{"invitation_id" => invitation.id},
      attempt: 1
    }

    assert :ok = TeamInvitationEmail.perform(job)
    assert_receive {:email, _, body}
    refute Map.has_key?(body, "template")
    assert body["to"] == [invitation.email]
    assert body["subject"] == "You have been invited to Form Delegate"

    url =
      "https://frontend.example.test/team-invitations/accept?token=#{TeamInvitation.token(invitation)}"

    for content <- [body["html"], body["text"]] do
      assert content =~ url
      assert content =~ DateTime.to_iso8601(invitation.expires_at)
    end

    assert body["html"] =~ "&lt;script&gt;Inviter&lt;/script&gt;"
    assert body["html"] =~ "&lt;em&gt;Team &amp; Co&lt;/em&gt;"
    refute body["html"] =~ "<script>"
    assert body["text"] =~ user.name
    assert body["text"] =~ team.name

    invitation |> Ecto.Changeset.change(status: :cancelled) |> Repo.update!()
    assert :ok = TeamInvitationEmail.perform(%{job | id: 302})
    refute_receive {:email, _, _}

    invitation
    |> Repo.reload!()
    |> Ecto.Changeset.change(status: :pending, expires_at: DateTime.add(DateTime.utc_now(), -60))
    |> Repo.update!()

    assert :ok = TeamInvitationEmail.perform(%{job | id: 303})
    refute_receive {:email, _, _}
  end
end
