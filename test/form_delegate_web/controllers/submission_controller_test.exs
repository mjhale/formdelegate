defmodule FormDelegateWeb.SubmissionControllerTest do
  use FormDelegateWeb.ConnCase

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
      conn =
        conn
        |> post(Routes.submission_path(conn, :create, form.id, @invalid_attrs))

      assert json_response(conn, 422)
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
    test "Responds with a list of user submissions", %{conn: conn, jwt: jwt, user: user} do
      form = FormDelegate.Factory.insert(:form, user: user)
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
              "form_integrations" => [],
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
  end

  describe "show/3" do
    @tag :as_inserted_user
    test "Responds with submission info if the submission is found", %{
      conn: conn,
      jwt: jwt,
      user: user
    } do
      form = FormDelegate.Factory.insert(:form, user: user)
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

  describe "without logged in user" do
    test "requires user authentication on all actions", %{conn: conn} do
      Enum.each(
        [
          get(conn, Routes.submission_path(conn, :index)),
          get(conn, Routes.submission_path(conn, :show, "1")),
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
    user = FormDelegate.Factory.insert(:user)
    form = FormDelegate.Factory.insert(:form, user: user)

    {:ok, form: form}
  end
end
