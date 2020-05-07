defmodule FormDelegateWeb.MessageControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

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

  describe "index/3" do
    @tag :as_inserted_user
    test "Responds with a list of user messages", %{conn: conn, jwt: jwt, user: user} do
      message = FormDelegate.Factory.insert(:message, user: user)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.message_path(conn, :index))
        |> json_response(200)

      expected = %{
        "data" => [
          %{
            "content" => message.content,
            "flagged_at" => nil,
            "flagged_type" => nil,
            "form" => nil,
            "id" => message.id,
            "inserted_at" => NaiveDateTime.to_iso8601(message.inserted_at),
            "sender" => message.sender,
            "unknown_fields" => nil,
            "updated_at" => NaiveDateTime.to_iso8601(message.updated_at)
          }
        ]
      }

      assert response == expected
    end
  end

  describe "show/3" do
    @tag :as_inserted_user
    test "Responds with message info if the message is found", %{conn: conn, jwt: jwt, user: user} do
      message = FormDelegate.Factory.insert(:message, user: user)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.message_path(conn, :show, message.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "content" => message.content,
          "flagged_at" => nil,
          "flagged_type" => nil,
          "form" => nil,
          "id" => message.id,
          "inserted_at" => NaiveDateTime.to_iso8601(message.inserted_at),
          "sender" => message.sender,
          "unknown_fields" => nil,
          "updated_at" => NaiveDateTime.to_iso8601(message.updated_at)
        }
      }

      assert response == expected
    end
  end

  describe "without logged in user" do
    test "requires user authentication on all actions", %{conn: conn} do
      Enum.each(
        [
          get(conn, Routes.message_path(conn, :index)),
          get(conn, Routes.message_path(conn, :show, "1")),
          get(conn, Routes.message_path(conn, :recent_activity))
        ],
        fn conn ->
          assert json_response(conn, 401)
          assert conn.halted
        end
      )
    end
  end
end
