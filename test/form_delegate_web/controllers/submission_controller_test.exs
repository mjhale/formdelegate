defmodule FormDelegateWeb.SubmissionControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

  @valid_attrs %{
    sender: "Drew Fo",
    email: "drew342194@gmail.com",
    content: "I have an issue with an order"
  }
  @valid_attrs_with_spam %{
    sender: "Guaranteed Spam",
    email: "akismet-guaranteed-spam@example.com",
    content: "This is certainly spam: viagra-test-123."
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
        |> post(Routes.submission_path(conn, :create, form.id, request: @valid_attrs))
        |> json_response(202)

      expected = %{"submission" => "Accepted"}

      assert response == expected
    end

    test "Responds with accepted with @valid_attrs_with_spam", %{
      conn: conn,
      form: form
    } do
      response =
        conn
        |> post(Routes.submission_path(conn, :create, form.id, request: @valid_attrs_with_spam))
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
        |> post(Routes.submission_path(conn, :create, form.id, submission: @invalid_attrs))

      assert json_response(conn, 422)
    end

    test "Responds with error for nonexistant form", %{
      conn: conn
    } do
      assert_error_sent :not_found, fn ->
        conn
        |> post(
          Routes.submission_path(conn, :create, Ecto.UUID.generate(), submission: @valid_attrs)
        )
        |> json_response(404)
      end
    end
  end

  describe "index/3" do
    @tag :as_inserted_user
    test "Responds with a list of user submissions", %{conn: conn, jwt: jwt, user: user} do
      submission = FormDelegate.Factory.insert(:submission, user: user)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.submission_path(conn, :index))
        |> json_response(200)

      expected = %{
        "data" => [
          %{
            "content" => submission.content,
            "flagged_at" => nil,
            "flagged_type" => nil,
            "form" => nil,
            "id" => submission.id,
            "inserted_at" => DateTime.to_iso8601(submission.inserted_at),
            "sender" => submission.sender,
            "sender_ip" => nil,
            "sender_referrer" => nil,
            "sender_user_agent" => nil,
            "unknown_fields" => nil,
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
      submission = FormDelegate.Factory.insert(:submission, user: user)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.submission_path(conn, :show, submission.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "content" => submission.content,
          "flagged_at" => nil,
          "flagged_type" => nil,
          "form" => nil,
          "id" => submission.id,
          "inserted_at" => DateTime.to_iso8601(submission.inserted_at),
          "sender" => submission.sender,
          "sender_ip" => nil,
          "sender_referrer" => nil,
          "sender_user_agent" => nil,
          "unknown_fields" => nil,
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
