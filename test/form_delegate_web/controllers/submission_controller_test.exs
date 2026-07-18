defmodule FormDelegateWeb.SubmissionControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.BillingCounts
  alias FormDelegate.Submissions
  alias FormDelegateWeb.Router.Helpers, as: Routes

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

    test "Responds with :not_found  error for nonexistant form", %{
      conn: conn
    } do
      conn =
        conn
        |> post(Routes.submission_path(conn, :create, Ecto.UUID.generate(), @valid_attrs))

      assert json_response(conn, 404)
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
    test "does not broaden results for malformed form filters", %{
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
        |> json_response(200)

      assert response == %{"data" => []}
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
