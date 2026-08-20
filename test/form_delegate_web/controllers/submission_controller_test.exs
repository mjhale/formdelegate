defmodule FormDelegateWeb.SubmissionControllerTest do
  use FormDelegateWeb.ConnCase
  use Oban.Testing, repo: FormDelegate.Repo

  alias FormDelegate.BillingCounts
  alias FormDelegate.Forms.Form
  alias FormDelegate.Repo
  alias FormDelegate.Submissions
  alias FormDelegate.Submissions.{Attachment, Submission}
  alias FormDelegateWeb.Router.Helpers, as: Routes

  defmodule AkismetProbe do
    @behaviour FormDelegate.Services.Akismet

    @impl true
    def is_spam?(_api_key, _submission) do
      send(Application.fetch_env!(:form_delegate, :akismet_probe_pid), :akismet_called)
      {:ok, false}
    end

    @impl true
    def submit_ham(_api_key, _submission), do: {:ok}

    @impl true
    def submit_spam(_api_key, _submission), do: {:ok}

    @impl true
    def verify_key(_api_key), do: {:ok, "valid"}
  end

  @valid_attrs %{
    message: "I have an issue with an order",
    name: "Drew Fo"
  }

  @valid_attrs_with_spam %{
    message: "This is certainly spam: viagra-test-123.",
    name: "akismet-guaranteed-spam@example.com"
  }

  @invalid_attrs %{}

  setup %{conn: conn, user: user} do
    jwt =
      case FormDelegateWeb.Guardian.encode_and_sign(user) do
        {:ok, jwt, _full_claims} ->
          jwt

        _ ->
          nil
      end

    {:ok, conn: put_req_header(conn, "accept", "application/json"), jwt: jwt}
  end

  describe "create/2" do
    setup [:create_form]

    test "Responds with accepted with @valid_attrs", %{
      conn: conn,
      form: form
    } do
      response =
        conn
        |> post(Routes.submission_path(conn, :create, form.id, @valid_attrs))
        |> json_response(202)

      expected = %{"submission" => "Accepted"}

      assert response == expected

      billing_count = BillingCounts.get_latest_billing_count_of_team(form.team_id)
      assert billing_count.submission_count == 1
    end

    @tag :debug
    test "Responds with accepted with @valid_attrs_with_spam", %{
      conn: conn,
      form: form
    } do
      response =
        conn
        |> post(Routes.submission_path(conn, :create, form.id, @valid_attrs_with_spam))
        |> json_response(202)

      expected = %{"submission" => "Accepted"}

      assert response == expected
    end

    test "Responds with error with @invalid_attrs for existant form", %{
      conn: conn,
      form: form
    } do
      period = BillingCounts.current_period_for_team!(form.team_id)

      conn =
        conn
        |> post(Routes.submission_path(conn, :create, form.id, @invalid_attrs))

      assert json_response(conn, 422)

      billing_count = BillingCounts.get_latest_billing_count_of_team(form.team_id)
      assert billing_count.submission_count == period.submission_count
    end

    test "rejects nested fields without enqueueing integrations", %{
      conn: conn,
      form: form
    } do
      period = BillingCounts.current_period_for_team!(form.team_id)

      Oban.Testing.with_testing_mode(:manual, fn ->
        response =
          conn
          |> post(
            Routes.submission_path(conn, :create, form.id, %{
              message: "I have an issue with an order",
              metadata: %{topic: "support"}
            })
          )
          |> json_response(422)

        assert response == %{
                 "error" => %{
                   "code" => 422,
                   "errors" => %{"fields" => ["is invalid"]},
                   "type" => "UNPROCESSABLE_ENTITY"
                 }
               }

        billing_count = BillingCounts.get_latest_billing_count_of_team(form.team_id)
        assert billing_count.submission_count == period.submission_count
        refute_enqueued(worker: FormDelegate.Jobs.SubmissionIntegrations)
      end)
    end

    test "Responds with :not_found  error for nonexistant form", %{
      conn: conn
    } do
      conn =
        conn
        |> post(Routes.submission_path(conn, :create, Ecto.UUID.generate(), @valid_attrs))

      assert json_response(conn, 404)
    end

    test "accepts an allowed Origin for a restricted form", %{conn: conn, form: form} do
      form = restrict_form(form, ["allowed.example"])

      response =
        conn
        |> put_req_header("origin", "https://allowed.example")
        |> post(Routes.submission_path(conn, :create, form.id, @valid_attrs))
        |> json_response(202)

      assert response == %{"submission" => "Accepted"}
    end

    test "accepts an allowed Referer when Origin is absent", %{conn: conn, form: form} do
      form = restrict_form(form, ["allowed.example"])

      response =
        conn
        |> put_req_header("referer", "https://allowed.example/contact?campaign=test")
        |> post(Routes.submission_path(conn, :create, form.id, @valid_attrs))
        |> json_response(202)

      assert response == %{"submission" => "Accepted"}
    end

    test "rejects a disallowed source before every submission side effect", %{
      conn: conn,
      form: form
    } do
      form = restrict_form(form, ["allowed.example"])
      previous_akismet_api = Application.fetch_env!(:form_delegate, :akismet_api)
      Application.put_env(:form_delegate, :akismet_api, AkismetProbe)
      Application.put_env(:form_delegate, :akismet_probe_pid, self())

      on_exit(fn ->
        Application.put_env(:form_delegate, :akismet_api, previous_akismet_api)
        Application.delete_env(:form_delegate, :akismet_probe_pid)
      end)

      event_name = [:form_delegate, :submission, :source_rejected]
      handler_id = "submission-source-test-#{System.unique_integer([:positive, :monotonic])}"
      test_pid = self()

      :telemetry.attach(
        handler_id,
        event_name,
        fn event, measurements, metadata, _config ->
          send(test_pid, {:submission_source_event, event, measurements, metadata})
        end,
        nil
      )

      on_exit(fn -> :telemetry.detach(handler_id) end)

      FormDelegateWeb.Endpoint.subscribe("user_form_submissions:#{form.user_id}")

      submission_count = Repo.aggregate(Submission, :count, :id)
      attachment_count = Repo.aggregate(Attachment, :count, :id)
      billing_count = BillingCounts.get_latest_billing_count_of_team(form.team_id)
      billing_count_rows = Repo.aggregate(FormDelegate.BillingCounts.BillingCount, :count, :id)

      Oban.Testing.with_testing_mode(:manual, fn ->
        response =
          conn
          |> put_req_header("origin", "https://evil.example")
          |> post(Routes.submission_path(conn, :create, form.id, @valid_attrs))
          |> json_response(403)

        assert response == %{
                 "error" => %{
                   "code" => 403,
                   "type" => "SUBMISSION_SOURCE_NOT_ALLOWED"
                 }
               }

        refute_enqueued(worker: FormDelegate.Jobs.SubmissionIntegrations)
      end)

      assert Repo.aggregate(Submission, :count, :id) == submission_count
      assert Repo.aggregate(Attachment, :count, :id) == attachment_count

      reloaded_billing_count = BillingCounts.get_latest_billing_count_of_team(form.team_id)
      assert reloaded_billing_count == billing_count

      assert Repo.aggregate(FormDelegate.BillingCounts.BillingCount, :count, :id) ==
               billing_count_rows

      refute_receive :akismet_called
      refute_receive %Phoenix.Socket.Broadcast{event: "new_msg"}

      assert_receive {:submission_source_event, ^event_name, %{count: 1}, metadata}
      assert metadata.form_id == form.id
      assert metadata.team_id == form.team_id
      assert metadata.reason == :host_mismatch
      assert metadata.observed_host == "evil.example"
      refute Map.has_key?(metadata, :fields)
    end

    test "restricted forms fail closed for missing, null, and malformed sources", %{
      form: form
    } do
      form = restrict_form(form, ["allowed.example"])

      sources = [nil, "null", "not a URL"]

      for source <- sources do
        conn = build_conn() |> put_req_header("accept", "application/json")
        conn = if source, do: put_req_header(conn, "origin", source), else: conn

        response =
          conn
          |> post(Routes.submission_path(conn, :create, form.id, @valid_attrs))
          |> json_response(403)

        assert response["error"]["type"] == "SUBMISSION_SOURCE_NOT_ALLOWED"
      end
    end

    test "renders a generic HTML 403 without exposing source rules", %{conn: conn, form: form} do
      form = restrict_form(form, ["allowed.example"])

      conn =
        conn
        |> delete_req_header("accept")
        |> put_req_header("accept", "text/html")
        |> put_req_header("origin", "https://evil.example")
        |> post(Routes.submission_path(conn, :create, form.id, @valid_attrs))

      body = html_response(conn, 403)

      assert body =~ "This form cannot accept submissions from this website."
      refute body =~ "allowed.example"
      refute body =~ "evil.example"
    end
  end

  describe "index/3" do
    @tag :as_inserted_user
    test "Responds with a list of user submissions", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      submission = FormDelegate.Factory.insert(:submission, form: form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.submission_path(conn, :index))
        |> json_response(200)

      expected = %{
        "data" => [
          %{
            "body" => submission.body,
            "data" => %{"message" => "Content submission body"},
            "flagged_at" => nil,
            "flagged_type" => nil,
            "form" => %{
              "callback_success_includes_data" => false,
              "callback_success_url" => nil,
              "email_integrations" => [],
              "hosts" => nil,
              "id" => form.id,
              "inserted_at" => DateTime.to_iso8601(form.inserted_at),
              "name" => form.name,
              "submission_source_policy" => "unrestricted",
              "submission_count" => 0,
              "updated_at" => DateTime.to_iso8601(form.updated_at),
              "verified" => false
            },
            "id" => submission.id,
            "inserted_at" => DateTime.to_iso8601(submission.inserted_at),
            "sender" => submission.sender,
            "sender_ip" => nil,
            "sender_referrer" => nil,
            "sender_user_agent" => nil,
            "updated_at" => DateTime.to_iso8601(submission.updated_at)
          }
        ]
      }

      assert response == expected
    end

    @tag :as_inserted_user
    test "filters submissions to an owned form", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      selected_form = FormDelegate.Factory.insert(:form, user: user, team: team)
      other_form = FormDelegate.Factory.insert(:form, user: user, team: team)
      selected_submission = FormDelegate.Factory.insert(:submission, form: selected_form)
      FormDelegate.Factory.insert(:submission, form: other_form)

      response =
        conn
        |> authorize(jwt)
        |> get(Routes.team_submission_path(conn, :index, team.id), %{
          "form" => [selected_form.id]
        })
        |> json_response(200)

      assert submission_ids(response) == [selected_submission.id]
    end

    @tag :as_inserted_user
    test "filters submissions to multiple owned forms", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      first_form = FormDelegate.Factory.insert(:form, user: user, team: team)
      second_form = FormDelegate.Factory.insert(:form, user: user, team: team)
      third_form = FormDelegate.Factory.insert(:form, user: user, team: team)

      first_submission = FormDelegate.Factory.insert(:submission, form: first_form)
      second_submission = FormDelegate.Factory.insert(:submission, form: second_form)
      FormDelegate.Factory.insert(:submission, form: third_form)

      response =
        conn
        |> authorize(jwt)
        |> get(Routes.team_submission_path(conn, :index, team.id), %{
          "form" => [first_form.id, second_form.id]
        })
        |> json_response(200)

      assert response |> submission_ids() |> MapSet.new() ==
               MapSet.new([first_submission.id, second_submission.id])
    end

    @tag :as_inserted_user
    test "does not return submissions for cross-team form filters", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      {_other_user, other_team, _other_membership} =
        FormDelegate.Factory.insert_user_with_membership()

      owned_form = FormDelegate.Factory.insert(:form, user: user, team: team)
      other_team_form = FormDelegate.Factory.insert(:form, team: other_team)

      FormDelegate.Factory.insert(:submission, form: owned_form)
      FormDelegate.Factory.insert(:submission, form: other_team_form)

      response =
        conn
        |> authorize(jwt)
        |> get(Routes.team_submission_path(conn, :index, team.id), %{
          "form" => [other_team_form.id]
        })
        |> json_response(200)

      assert response == %{"data" => []}
    end

    @tag :as_inserted_user
    test "rejects malformed form filters", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      FormDelegate.Factory.insert(:submission, form: form)

      response =
        conn
        |> authorize(jwt)
        |> get(Routes.team_submission_path(conn, :index, team.id), %{
          "form" => ["not-a-uuid"]
        })
        |> json_response(400)

      assert response == %{
               "error" => %{
                 "code" => 400,
                 "type" => "INVALID_FORM_FILTER"
               }
             }
    end

    @tag :as_inserted_user
    test "rejects blank, mixed, map, and unsupported form filters", %{
      conn: conn,
      jwt: jwt,
      team: team
    } do
      valid_id = Ecto.UUID.generate()

      for form_filter <- ["", [valid_id, "not-a-uuid"], %{"id" => valid_id}] do
        response =
          conn
          |> authorize(jwt)
          |> get(Routes.team_submission_path(conn, :index, team.id), %{
            "form" => form_filter
          })
          |> json_response(400)

        assert get_in(response, ["error", "type"]) == "INVALID_FORM_FILTER"
      end

      for unsupported_filter <- [nil, 123] do
        assert {:error, :invalid_form_filter} =
                 Submissions.list_submissions_of_team(team, %{"form" => unsupported_filter})
      end
    end

    @tag :as_inserted_user
    test "rejects ambiguous form filter keys", %{team: team} do
      form_id = Ecto.UUID.generate()

      assert {:error, :invalid_form_filter} =
               Submissions.list_submissions_of_team(team, %{
                 "form" => form_id,
                 "form[]" => form_id
               })
    end

    @tag :as_inserted_user
    test "accepts the form bracket key, scalar IDs, empty lists, and duplicate IDs", %{
      user: user,
      team: team
    } do
      selected_form = FormDelegate.Factory.insert(:form, user: user, team: team)
      selected_submission = FormDelegate.Factory.insert(:submission, form: selected_form)

      assert {:ok, scalar_page} =
               Submissions.list_submissions_of_team(team, %{"form[]" => selected_form.id})

      assert Enum.map(scalar_page.entries, & &1.id) == [selected_submission.id]

      assert {:ok, duplicate_page} =
               Submissions.list_submissions_of_team(team, %{
                 "form" => [selected_form.id, selected_form.id]
               })

      assert Enum.map(duplicate_page.entries, & &1.id) == [selected_submission.id]

      assert {:ok, unfiltered_page} =
               Submissions.list_submissions_of_team(team, %{"form" => []})

      assert Enum.map(unfiltered_page.entries, & &1.id) == [selected_submission.id]
    end

    @tag :as_inserted_user
    test "returns an empty page for a valid deleted form ID", %{
      user: user,
      team: team
    } do
      deleted_form = FormDelegate.Factory.insert(:form, user: user, team: team)
      deleted_form_id = deleted_form.id
      FormDelegate.Repo.delete!(deleted_form)

      assert {:ok, page} =
               Submissions.list_submissions_of_team(team, %{"form" => deleted_form_id})

      assert page.entries == []
    end

    @tag :as_inserted_user
    test "combines form filters with search", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      selected_form = FormDelegate.Factory.insert(:form, user: user, team: team)
      other_form = FormDelegate.Factory.insert(:form, user: user, team: team)

      matching_submission =
        FormDelegate.Factory.insert(:submission,
          form: selected_form,
          fields: %{message: "Needle in selected form"}
        )

      FormDelegate.Factory.insert(:submission,
        form: selected_form,
        fields: %{message: "No match here"}
      )

      FormDelegate.Factory.insert(:submission,
        form: other_form,
        fields: %{message: "Needle in another form"}
      )

      response =
        conn
        |> authorize(jwt)
        |> get(Routes.team_submission_path(conn, :index, team.id), %{
          "form" => [selected_form.id],
          "query" => "Needle"
        })
        |> json_response(200)

      assert submission_ids(response) == [matching_submission.id]
    end
  end

  describe "show/3" do
    @tag :as_inserted_user
    test "Responds with submission info if the submission is found", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      submission = FormDelegate.Factory.insert(:submission, form: form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.submission_path(conn, :show, submission.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "body" => submission.body,
          "data" => %{"message" => "Content submission body"},
          "flagged_at" => nil,
          "flagged_type" => nil,
          "form" => response["data"]["form"],
          "id" => submission.id,
          "inserted_at" => DateTime.to_iso8601(submission.inserted_at),
          "sender" => submission.sender,
          "sender_ip" => nil,
          "sender_referrer" => nil,
          "sender_user_agent" => nil,
          "updated_at" => DateTime.to_iso8601(submission.updated_at)
        }
      }

      assert response == expected
    end
  end

  describe "spam/3" do
    setup [:use_invalid_akismet_key]

    @tag :as_inserted_user
    test "marks a submission as spam when Akismet feedback fails", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      submission = FormDelegate.Factory.insert(:submission, form: form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.team_submission_spam_path(conn, :spam, team.id, submission.id))
        |> json_response(200)

      assert %{
               "data" => %{
                 "flagged_at" => flagged_at,
                 "flagged_type" => %{"type" => "spam"}
               }
             } = response

      assert flagged_at
    end
  end

  describe "ham/3" do
    setup [:use_invalid_akismet_key]

    @tag :as_inserted_user
    test "marks a submission as ham when Akismet feedback fails", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      submission = FormDelegate.Factory.insert(:submission, form: form)

      {:ok, submission} =
        submission.id
        |> Submissions.get_submission!()
        |> Submissions.flag_submission(%{
          flagged_at: DateTime.utc_now(),
          flagged_type: Submissions.get_or_create_flagged_type(%{type: "spam"})
        })

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.team_submission_ham_path(conn, :ham, team.id, submission.id))
        |> json_response(200)

      assert %{
               "data" => %{
                 "flagged_at" => nil,
                 "flagged_type" => nil
               }
             } = response
    end
  end

  describe "recent_activity/3" do
    @tag :as_inserted_user
    test "returns recent activity for the requested team only", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      {_other_user, other_team, _other_membership} =
        FormDelegate.Factory.insert_user_with_membership()

      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      other_team_form = FormDelegate.Factory.insert(:form, team: other_team)

      FormDelegate.Factory.insert(:submission, form: form)
      FormDelegate.Factory.insert(:submission, form: other_team_form)

      response =
        conn
        |> authorize(jwt)
        |> get(Routes.team_submission_recent_activity_path(conn, :recent_activity, team.id))
        |> json_response(200)

      assert %{"submission_count" => 1} = activity_for(response, Date.utc_today())
    end

    @tag :as_inserted_user
    test "does not authorize recent activity for another team", %{
      conn: conn,
      jwt: jwt
    } do
      other_team = FormDelegate.Factory.insert(:team)

      conn =
        conn
        |> authorize(jwt)
        |> get(Routes.team_submission_recent_activity_path(conn, :recent_activity, other_team.id))

      assert json_response(conn, 404)
    end

    @tag :as_inserted_user
    test "legacy route returns activity for the user's oldest membership", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: oldest_team
    } do
      newer_team = FormDelegate.Factory.insert(:team)

      FormDelegate.Repo.insert!(%FormDelegate.Memberships.Membership{
        user_id: user.id,
        team_id: newer_team.id
      })

      oldest_form = FormDelegate.Factory.insert(:form, user: user, team: oldest_team)
      newer_form = FormDelegate.Factory.insert(:form, user: user, team: newer_team)

      FormDelegate.Factory.insert(:submission, form: oldest_form)
      FormDelegate.Factory.insert(:submission, form: newer_form)
      FormDelegate.Factory.insert(:submission, form: newer_form)

      response =
        conn
        |> authorize(jwt)
        |> get(Routes.submission_recent_activity_path(conn, :recent_activity))
        |> json_response(200)

      assert %{"submission_count" => 1} = activity_for(response, Date.utc_today())
    end
  end

  describe "without logged in user" do
    test "requires user authentication on all actions", %{conn: conn} do
      team_id = Ecto.UUID.generate()

      Enum.each(
        [
          get(conn, Routes.submission_path(conn, :index)),
          get(conn, Routes.submission_path(conn, :show, "1")),
          get(conn, Routes.team_submission_recent_activity_path(conn, :recent_activity, team_id)),
          get(conn, Routes.submission_recent_activity_path(conn, :recent_activity))
        ],
        fn conn ->
          assert json_response(conn, 401)
          assert conn.halted
        end
      )
    end
  end

  defp create_form(_context) do
    {user, team, _membership} = FormDelegate.Factory.insert_user_with_membership()
    form = FormDelegate.Factory.insert(:form, user: user, team: team)

    {:ok, form: form}
  end

  defp restrict_form(form, hosts) do
    form
    |> Form.changeset(%{hosts: hosts, submission_source_policy: :restricted})
    |> Repo.update!()
  end

  defp use_invalid_akismet_key(_context) do
    previous_api_key = Application.get_env(:form_delegate, :akismet_api_key)

    Application.put_env(:form_delegate, :akismet_api_key, "invalid")

    on_exit(fn ->
      Application.put_env(:form_delegate, :akismet_api_key, previous_api_key)
    end)
  end

  defp authorize(conn, jwt), do: put_req_header(conn, "authorization", "bearer: " <> jwt)

  defp submission_ids(%{"data" => submissions}) do
    Enum.map(submissions, & &1["id"])
  end

  defp activity_for(%{"data" => activity}, date) do
    Enum.find(activity, &(&1["day"] == Date.to_iso8601(date)))
  end
end
