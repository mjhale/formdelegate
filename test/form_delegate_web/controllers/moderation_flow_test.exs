defmodule FormDelegateWeb.ModerationFlowTest do
  use FormDelegateWeb.ConnCase
  use Oban.Testing, repo: FormDelegate.Repo
  import Ecto.Query
  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Jobs.SubmissionIntegrations
  alias FormDelegate.{Repo, Submissions}
  alias FormDelegate.Submissions.{Moderation, Submission}
  alias FormDelegateWeb.Router.Helpers, as: Routes

  defmodule LocalDelivery do
    def post(_url, _headers, body) do
      send(self(), {:local_delivery, body})
      {:ok, 200, %{}}
    end
  end

  defmodule NoExternalFilter do
    @behaviour FormDelegate.Services.Akismet
    @impl true
    def is_spam?(_, _), do: raise("external filtering must not run")
    @impl true
    def submit_ham(_, _), do: raise("external feedback must not run")
    @impl true
    def submit_spam(_, _), do: raise("external feedback must not run")
    @impl true
    def verify_key(_), do: raise("external key verification must not run")
  end

  @moduletag :as_inserted_user
  setup %{user: user, team: team} do
    previous =
      for key <- [:email_provider_http_client, :akismet_api],
          into: %{},
          do: {key, Application.get_env(:form_delegate, key)}

    Application.put_env(:form_delegate, :email_provider_http_client, LocalDelivery)
    Application.put_env(:form_delegate, :akismet_api, NoExternalFilter)

    on_exit(fn ->
      Enum.each(previous, fn {k, v} ->
        if v,
          do: Application.put_env(:form_delegate, k, v),
          else: Application.delete_env(:form_delegate, k)
      end)
    end)

    user = user |> Ecto.Changeset.change(confirmed_at: DateTime.utc_now()) |> Repo.update!()
    form = insert(:form, user: user, team: team)

    integration =
      Repo.insert!(%EmailIntegration{
        form_id: form.id,
        integration_type: :email,
        enabled: true,
        email_provider: :postmark,
        email_provider_status: :verified,
        email_provider_config: %{"from_address" => "synthetic@example.test"},
        email_provider_secrets: %{"server_token" => "synthetic-local-only"}
      })

    insert(:email_integration_recipient,
      form_integration_id: integration.id,
      email: "owner@example.test",
      type: "to"
    )

    {:ok, token, _} = FormDelegateWeb.Guardian.encode_and_sign(user)
    {:ok, form: form, token: token}
  end

  test "public intake, owner inspection, approval, and local delivery work end to end", %{
    form: form,
    team: team,
    token: token,
    user: user
  } do
    FormDelegateWeb.Endpoint.subscribe("user_form_submissions:#{user.id}")
    accepted = submit(form, "こんにちは、注文の相談です https://example.test/order")
    assert accepted.moderation_status == :accepted
    assert_receive {:local_delivery, delivered}
    assert delivered["To"] =~ "owner@example.test"

    held = submit(form, "Please review this claim your prize advertisement")
    assert held.moderation_status == :review
    held_id = held.id

    assert_receive %Phoenix.Socket.Broadcast{
      event: "new_msg",
      payload: %{data: %{id: ^held_id, moderation_status: :review}}
    }

    refute_receive {:local_delivery, _}

    inspected =
      build_conn()
      |> auth(token)
      |> get(Routes.team_submission_path(build_conn(), :show, team.id, held.id))
      |> json_response(200)

    assert inspected["data"]["spam_assessment"]["reasons"] == ["commercial_solicitation"]
    original = held.spam_assessment
    approved = approve(held, team, token)
    assert approved["moderation_status"] == "approved"
    assert approved["reviewed_by_id"] == user.id
    assert approved["spam_assessment"] == original
    assert_receive {:local_delivery, _}
    approve(held, team, token)
    refute_receive {:local_delivery, _}
    assert Repo.reload!(held).integrations_enqueued_at
  end

  test "clear spam remains stored, suppressed, and recoverable", %{
    form: form,
    team: team,
    token: token
  } do
    spam = submit(form, "Buy cheap products and send your password")
    assert spam.moderation_status == :spam
    assert spam.flagged_at
    refute_receive {:local_delivery, _}
    assert approve(spam, team, token)["flagged_at"] == nil
    assert_receive {:local_delivery, _}
    assert Repo.reload!(spam).body == "Buy cheap products and send your password"
  end

  test "settings persist through owner API and only affect subsequent submissions", %{
    form: form,
    team: team,
    token: token
  } do
    url = Routes.team_form_path(build_conn(), :update, team.id, form.id)

    response =
      build_conn()
      |> auth(token)
      |> put(url, form: %{spam_filter_mode: "review_all"})
      |> json_response(200)

    assert response["data"]["spam_filter_mode"] == "review_all"
    held = submit(form, "Hello there")
    assert held.moderation_status == :review
    refute_receive {:local_delivery, _}

    build_conn()
    |> auth(token)
    |> put(url, form: %{spam_filter_mode: "off"})
    |> json_response(200)

    assert submit(form, "Buy cheap products and send your password").moderation_status ==
             :accepted

    assert_receive {:local_delivery, _}
    assert Repo.reload!(held).moderation_status == :review

    build_conn()
    |> auth(token)
    |> put(url, form: %{spam_filter_mode: "invented"})
    |> json_response(422)
  end

  test "duplicates are scoped to form and hold the third copy", %{form: form} do
    assert submit(form, "Same synthetic message").moderation_status == :accepted
    assert submit(form, " Same  synthetic message ").moderation_status == :accepted
    assert submit(form, "Same synthetic message").moderation_status == :review
    other = insert(:form, user: form.user, team: form.team)
    assert submit(other, "Same synthetic message").moderation_status == :accepted
  end

  test "IP bursts are review signals and do not trust spoofed forwarded headers", %{form: form} do
    for n <- 1..10 do
      assert submit(form, "Unique legitimate message #{n}").moderation_status == :accepted
    end

    burst = submit(form, "One more message")
    assert burst.moderation_status == :review
    assert "submission_burst" in burst.spam_assessment["reasons"]
    assert burst.sender_ip == "127.0.0.1"
  end

  test "expiry of duplicate and IP windows permits subsequent legitimate input", %{form: form} do
    for _ <- 1..10 do
      insert(:submission,
        form: form,
        sender_ip: "127.0.0.1",
        inserted_at: DateTime.add(DateTime.utc_now(), -601, :second)
      )
    end

    assert submit(form, "Fresh message").moderation_status == :accepted
  end

  test "public fields cannot overwrite internal decisions", %{form: form} do
    s =
      submit(form, "Buy cheap products and send your password", %{
        moderation_status: "approved",
        spam_filter_mode: "off",
        spam_assessment: "safe"
      })

    assert s.moderation_status == :spam
    assert s.spam_assessment["engine"] == "builtin-v1"
    assert s.fields["moderation_status"] == "approved"
  end

  test "owner can recover pending classification without deleting content", %{
    form: form,
    team: team,
    token: token
  } do
    pending = insert(:submission, form: form)
    assert approve(pending, team, token)["moderation_status"] == "approved"
    assert_receive {:local_delivery, _}
  end

  test "legacy records with unknown delivery history are not replayed on approval", %{
    form: form,
    team: team,
    token: token
  } do
    legacy =
      insert(:submission,
        form: form,
        moderation_status: :unclassified,
        integrations_enqueued_at: DateTime.utc_now()
      )

    assert approve(legacy, team, token)["moderation_status"] == "approved"
    refute_receive {:local_delivery, _}
  end

  test "unauthorized user cannot approve or change another team's settings", %{
    form: form,
    team: team
  } do
    held = submit(form, "Please send your password")
    {outsider, _, _} = insert_user_with_membership()
    {:ok, token, _} = FormDelegateWeb.Guardian.encode_and_sign(outsider)

    build_conn()
    |> auth(token)
    |> put(Routes.team_submission_ham_path(build_conn(), :ham, team.id, held.id))
    |> json_response(404)

    build_conn()
    |> auth(token)
    |> put(Routes.team_form_path(build_conn(), :update, team.id, form.id),
      form: %{spam_filter_mode: "off"}
    )
    |> json_response(404)

    assert Repo.reload!(held).moderation_status == :review
    assert Repo.reload!(form).spam_filter_mode == :balanced
  end

  test "queued integrations recheck moderation and approvals do not create duplicate jobs", %{
    form: form,
    user: user
  } do
    Oban.Testing.with_testing_mode(:manual, fn ->
      s = submit(form, "Normal queue message")
      assert [_] = all_enqueued(worker: SubmissionIntegrations)
      {:ok, s} = Moderation.review(s, :spam, user.id)
      assert :ok = perform_job(SubmissionIntegrations, %{submission_id: s.id})
      refute_receive {:local_delivery, _}
      {:ok, _} = Moderation.review(s, :approved, user.id)
      assert [_, _] = all_enqueued(worker: SubmissionIntegrations)
      assert :ok = perform_job(SubmissionIntegrations, %{submission_id: s.id})
      assert_receive {:local_delivery, _}
    end)
  end

  test "empty inputs rejected; whitespace preserved in review", %{form: form} do
    build_conn()
    |> put_req_header("accept", "application/json")
    |> post(Routes.submission_path(build_conn(), :create, form.id), %{})
    |> json_response(422)

    s = submit(form, "   ", %{name: "  "})
    assert s.moderation_status == :review
    refute_receive {:local_delivery, _}
  end

  defp submit(form, message, extra \\ %{}) do
    params = Map.merge(%{name: "Synthetic sender", message: message}, extra)

    conn =
      build_conn()
      |> put_req_header("accept", "application/json")
      |> put_req_header("x-forwarded-for", "192.0.2.1")

    assert %{"submission" => "Accepted"} =
             conn
             |> post(Routes.submission_path(conn, :create, form.id), params)
             |> json_response(202)

    Repo.one!(
      from s in Submission,
        where: s.form_id == ^form.id,
        order_by: [desc: s.inserted_at],
        limit: 1
    )
    |> then(&Submissions.get_submission!(&1.id))
  end

  defp auth(conn, token),
    do:
      conn
      |> put_req_header("accept", "application/json")
      |> put_req_header("authorization", "Bearer " <> token)

  defp approve(s, team, token) do
    build_conn()
    |> auth(token)
    |> put(Routes.team_submission_ham_path(build_conn(), :ham, team.id, s.id))
    |> json_response(200)
    |> Map.fetch!("data")
  end
end
