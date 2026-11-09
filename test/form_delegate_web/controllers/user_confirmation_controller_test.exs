defmodule FormDelegateWeb.UserConfirmationControllerTest do
  use FormDelegateWeb.ConnCase

  import FormDelegate.ConfirmationLimiterSupport

  alias FormDelegate.{Accounts, Repo}
  alias FormDelegate.Accounts.{ConfirmationRateLimit, User}
  alias FormDelegate.Jobs.UserConfirmationEmail
  alias FormDelegateWeb.Guardian

  setup %{conn: conn, user: user} do
    conn = put_req_header(conn, "accept", "application/json")

    conn =
      if user do
        {:ok, token, _} = Guardian.encode_and_sign(user, %{}, token_type: "access")
        put_req_header(conn, "authorization", "Bearer " <> token)
      else
        conn
      end

    {:ok, conn: conn}
  end

  test "anonymous callers cannot send mail", %{conn: conn} do
    conn = post(conn, "/v1/users/confirm", %{user: %{email: "unknown@example.test"}})
    assert conn.status == 401
    assert Repo.aggregate(Oban.Job, :count) == 0
  end

  @tag :as_inserted_user
  test "uses signed-in account, preserves valid token, and blocks repeated sends", %{
    conn: conn,
    user: user
  } do
    other = insert(:user)
    user = eligible(user)
    original = user.confirmation_token
    conn = resend(conn, %{user: %{email: other.email}})
    assert json_response(conn, 202)["data"]["status"] == "sent"
    [job] = Repo.all(Oban.Job)
    assert job.args == %{"user_id" => user.id}
    assert Repo.get!(User, user.id).confirmation_token == original

    conn = resend(recycle(conn), %{})
    assert json_response(conn, 429)["error"]["type"] == "RATE_LIMITED"
    assert [retry] = get_resp_header(conn, "retry-after")
    assert String.to_integer(retry) in 1..60
    assert Repo.aggregate(Oban.Job, :count) == 1
    assert Repo.get!(User, user.id).confirmation_token == original
    assert Repo.get!(User, other.id).confirmation_token == other.confirmation_token
  end

  test "registration email also starts the cooldown", %{conn: conn} do
    {:ok, user} = Accounts.register_user(registration_params())
    {:ok, token, _} = Guardian.encode_and_sign(user, %{}, token_type: "access")
    conn = put_req_header(conn, "authorization", "Bearer " <> token)

    assert resend(conn, %{}) |> json_response(429)
    assert Repo.aggregate(Oban.Job, :count) == 0
  end

  @tag :as_inserted_user
  test "five resends in the rolling hour block another without rotating token", %{
    conn: conn,
    user: user
  } do
    user = eligible(user)
    seed_sends(user.id, 5, 120)
    response = resend(conn, %{}) |> json_response(429)
    assert response["error"]["retry_after"] in 3470..3480
    assert Repo.aggregate(Oban.Job, :count) == 0
    assert Repo.get!(User, user.id).confirmation_token == user.confirmation_token
  end

  @tag :as_inserted_user
  test "ten resends in the rolling day block another", %{conn: conn, user: user} do
    eligible(user)
    seed_sends(user.id, 10, 7_200)
    response = resend(conn, %{}) |> json_response(429)
    assert response["error"]["retry_after"] in 79_190..79_200
    assert Repo.aggregate(Oban.Job, :count) == 0
  end

  @tag :as_inserted_user
  test "accounts sharing a connection IP have independent limits and ignore forwarded headers", %{
    conn: conn,
    user: user
  } do
    eligible(user)
    assert resend(conn, %{}) |> json_response(202)

    changed_headers =
      conn
      |> put_req_header("x-forwarded-for", "192.0.2.22")
      |> put_req_header("cf-connecting-ip", "192.0.2.23")

    assert resend(changed_headers, %{}) |> json_response(429)

    {other, _team, _membership} = insert_user_with_membership()
    eligible(other)
    {:ok, token, _} = Guardian.encode_and_sign(other, %{}, token_type: "access")

    other_conn =
      build_conn()
      |> put_req_header("accept", "application/json")
      |> put_req_header("authorization", "Bearer " <> token)

    assert other_conn.remote_ip == conn.remote_ip
    assert resend(other_conn, %{}) |> json_response(202)
    assert Repo.aggregate(Oban.Job, :count) == 2
  end

  @tag :as_inserted_user
  test "pending job returns already queued without replacing an expired token", %{
    conn: conn,
    user: user
  } do
    user =
      Repo.update!(
        Ecto.Changeset.change(user,
          confirmation_sent_at: DateTime.add(DateTime.utc_now(), -6 * 86_400)
        )
      )

    job =
      Oban.Testing.with_testing_mode(:manual, fn ->
        %{user_id: user.id} |> UserConfirmationEmail.new() |> Oban.insert!()
      end)

    assert resend(conn, %{}) |> json_response(202) == %{
             "data" => %{"status" => "already_queued", "retry_after" => 60}
           }

    assert Repo.aggregate(Oban.Job, :count) == 1
    assert Repo.get!(Oban.Job, job.id).args == %{"user_id" => user.id}
    assert Repo.get!(User, user.id).confirmation_token == user.confirmation_token
    assert :ok = ConfirmationRateLimit.check(user.id)
  end

  @tag :as_inserted_user
  test "already verified accounts do not get tokens or mail", %{conn: conn, user: user} do
    {:ok, user} = Accounts.confirm_user(user)

    assert resend(conn, %{}) |> json_response(200) == %{
             "data" => %{"status" => "already_verified"}
           }

    assert Repo.aggregate(Oban.Job, :count) == 0
    assert Repo.get!(User, user.id).confirmation_token == nil
  end

  @tag :as_inserted_user
  test "expired token is replaced only on an allowed resend", %{conn: conn, user: user} do
    user =
      Repo.update!(
        Ecto.Changeset.change(user,
          confirmation_sent_at: DateTime.add(DateTime.utc_now(), -6 * 86_400)
        )
      )

    assert resend(conn, %{}) |> json_response(202)
    updated = Repo.get!(User, user.id)
    refute updated.confirmation_token == user.confirmation_token
    assert {:ok, _} = Accounts.confirm_user(updated)
  end

  @tag :as_inserted_user
  test "a token with less than a day left is rotated so the resent link stays usable", %{
    conn: conn,
    user: user
  } do
    sent_at = DateTime.add(DateTime.utc_now(), -(4 * 86_400 + 3_600))
    user = Repo.update!(Ecto.Changeset.change(user, confirmation_sent_at: sent_at))

    assert resend(conn, %{}) |> json_response(202)
    updated = Repo.get!(User, user.id)
    refute updated.confirmation_token == user.confirmation_token
    assert User.confirmation_token_remaining(updated) > 4 * 86_400
  end

  @tag :as_inserted_user
  test "confirmation link remains publicly accessible", %{conn: conn, user: user} do
    conn =
      conn
      |> delete_req_header("authorization")
      |> get("/v1/users/confirm", %{token: user.confirmation_token})

    assert json_response(conn, 200)["data"]["email"] == user.email
    assert Repo.get!(User, user.id).confirmed_at
  end

  defp resend(conn, params) do
    Oban.Testing.with_testing_mode(:manual, fn -> post(conn, "/v1/users/confirm", params) end)
  end

  defp registration_params do
    %{
      captcha: "10000000-aaaa-bbbb-cccc-000000000001",
      user: %{
        email: "registered@formdelegate.com",
        name: "Form User",
        password: "a valid password!"
      }
    }
  end

  defp eligible(user) do
    Repo.update!(
      Ecto.Changeset.change(user, confirmation_sent_at: DateTime.add(DateTime.utc_now(), -120))
    )
  end
end
