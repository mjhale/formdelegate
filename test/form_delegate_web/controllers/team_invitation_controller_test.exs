defmodule FormDelegateWeb.TeamInvitationControllerTest do
  use FormDelegateWeb.ConnCase
  use Bamboo.Test

  alias FormDelegate.Jobs.TeamInvitationEmail
  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Repo
  alias FormDelegate.Teams
  alias FormDelegate.Teams.TeamInvitation
  alias FormDelegateWeb.Router.Helpers, as: Routes

  defmodule InvalidTeamInvitationEmailWorker do
    def new(_args) do
      %Oban.Job{}
      |> Ecto.Changeset.change(args: %{})
      |> Ecto.Changeset.add_error(:args, "is invalid")
    end
  end

  setup %{conn: conn, user: user} do
    jwt =
      case FormDelegateWeb.Guardian.encode_and_sign(user) do
        {:ok, jwt, _full_claims} -> jwt
        _ -> nil
      end

    {:ok, conn: put_req_header(conn, "accept", "application/json"), jwt: jwt}
  end

  describe "index/3" do
    @tag :as_inserted_user
    test "lists pending team invitations for a billing member", %{
      conn: conn,
      jwt: jwt,
      team: team,
      user: user
    } do
      pending_invitation =
        insert_invitation(team,
          inviter: user,
          email: "pending-invitee@example.com"
        )

      cancelled_invitation =
        insert_invitation(team,
          inviter: user,
          email: "cancelled-invitee@example.com"
        )

      cancelled_invitation
      |> TeamInvitation.cancel_changeset()
      |> Repo.update!()

      response =
        conn
        |> authenticate(jwt)
        |> get(Routes.team_invitation_path(conn, :index, team.id))
        |> json_response(200)

      assert [invitation] = response["data"]
      assert invitation["id"] == pending_invitation.id
      assert invitation["email"] == "pending-invitee@example.com"
      assert invitation["status"] == "pending"
      assert invitation["team"] == %{"id" => team.id, "name" => team.name}

      assert invitation["inviter"] == %{
               "id" => user.id,
               "email" => user.email,
               "name" => user.name
             }
    end

    @tag :as_inserted_user
    test "returns not found for malformed team ids", %{conn: conn, jwt: jwt} do
      response =
        conn
        |> authenticate(jwt)
        |> get(Routes.team_invitation_path(conn, :index, "not-a-uuid"))
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
    end
  end

  describe "create/3" do
    @tag :as_inserted_user
    test "creates an invitation and sends email for an existing user", %{
      conn: conn,
      jwt: jwt,
      team: team
    } do
      invitee = insert(:user, email: "existing-invitee@example.com")

      response =
        conn
        |> authenticate(jwt)
        |> post(Routes.team_invitation_path(conn, :create, team.id),
          invitation: %{email: invitee.email}
        )
        |> json_response(201)

      assert response["data"]["email"] == invitee.email
      assert response["data"]["status"] == "pending"
      refute Map.has_key?(response["data"], "token")

      invitation = Repo.get_by!(TeamInvitation, team_id: team.id, email: invitee.email)
      assert is_nil(invitation.token)
      assert is_binary(invitation.token_digest)

      assert_delivered_email_matches(%{
        to: [{_, "existing-invitee@example.com"}],
        subject: "You have been invited to Form Delegate",
        text_body: text_body
      })

      [_, raw_token] = Regex.run(~r/token=([^\s]+)/, text_body)

      assert TeamInvitation.token_digest(raw_token) == invitation.token_digest
      refute raw_token == invitation.token_digest
      refute text_body =~ invitation.token_digest
      assert text_body =~ "a Form Delegate team"
    end

    @tag :as_inserted_user
    test "ignores client supplied expiration", %{conn: conn, jwt: jwt, team: team} do
      supplied_expires_at =
        DateTime.utc_now()
        |> DateTime.add(365, :day)
        |> DateTime.truncate(:second)

      response =
        conn
        |> authenticate(jwt)
        |> post(Routes.team_invitation_path(conn, :create, team.id),
          invitation: %{
            email: "server-expiry@example.com",
            expires_at: DateTime.to_iso8601(supplied_expires_at)
          }
        )
        |> json_response(201)

      {:ok, actual_expires_at, _offset} = DateTime.from_iso8601(response["data"]["expires_at"])
      seconds_until_expiry = DateTime.diff(actual_expires_at, DateTime.utc_now(), :second)

      assert seconds_until_expiry > 6 * 24 * 60 * 60
      assert seconds_until_expiry < 8 * 24 * 60 * 60
      assert DateTime.compare(actual_expires_at, supplied_expires_at) != :eq
    end

    @tag :as_inserted_user
    test "rejects duplicate pending invitations", %{conn: conn, jwt: jwt, team: team, user: user} do
      insert_invitation(team, inviter: user, email: "duplicate-invitee@example.com")

      response =
        conn
        |> authenticate(jwt)
        |> post(Routes.team_invitation_path(conn, :create, team.id),
          invitation: %{email: "duplicate-invitee@example.com"}
        )
        |> json_response(400)

      assert response == %{"error" => %{"code" => 400, "type" => "DUPLICATE_INVITATION"}}
    end

    @tag :as_inserted_user
    test "normalizes concurrent duplicate creates", %{team: team, user: user} do
      email = "race-duplicate@example.com"
      parent = self()

      tasks =
        for _index <- 1..2 do
          Task.async(fn ->
            send(parent, :ready)

            receive do
              :go ->
                Teams.create_invitation(user, team, %{"email" => email})
            end
          end)
        end

      assert_receive :ready
      assert_receive :ready
      Enum.each(tasks, fn task -> send(task.pid, :go) end)

      results = Task.await_many(tasks, 5_000)

      assert Enum.count(results, &match?({:ok, %TeamInvitation{}}, &1)) == 1
      assert Enum.count(results, &match?({:error, :duplicate_invitation}, &1)) == 1
    end

    @tag :as_inserted_user
    test "rolls back invitation insert when email job enqueue fails", %{team: team, user: user} do
      previous_worker = Application.get_env(:form_delegate, :team_invitation_email_worker)

      Application.put_env(
        :form_delegate,
        :team_invitation_email_worker,
        InvalidTeamInvitationEmailWorker
      )

      on_exit(fn ->
        if previous_worker do
          Application.put_env(:form_delegate, :team_invitation_email_worker, previous_worker)
        else
          Application.delete_env(:form_delegate, :team_invitation_email_worker)
        end
      end)

      assert {:error, %Ecto.Changeset{}} =
               Teams.create_invitation(user, team, %{
                 "email" => "invalid-job@example.com"
               })

      refute Repo.get_by(TeamInvitation, team_id: team.id, email: "invalid-job@example.com")
    end

    @tag :as_inserted_user
    test "does not treat expired pending invitations as duplicates", %{
      conn: conn,
      jwt: jwt,
      team: team,
      user: user
    } do
      expired_invitation =
        insert_invitation(team,
          inviter: user,
          email: "expired-duplicate@example.com",
          expires_at: DateTime.add(DateTime.utc_now(), -1, :day)
        )

      response =
        conn
        |> authenticate(jwt)
        |> post(Routes.team_invitation_path(conn, :create, team.id),
          invitation: %{email: "expired-duplicate@example.com"}
        )
        |> json_response(201)

      assert response["data"]["email"] == "expired-duplicate@example.com"
      assert Repo.get!(TeamInvitation, expired_invitation.id).status == :cancelled
    end

    @tag :as_inserted_user
    test "rejects inviting an existing team member", %{
      conn: conn,
      jwt: jwt,
      team: team,
      user: user
    } do
      response =
        conn
        |> authenticate(jwt)
        |> post(Routes.team_invitation_path(conn, :create, team.id),
          invitation: %{email: String.upcase(user.email)}
        )
        |> json_response(400)

      assert response == %{"error" => %{"code" => 400, "type" => "ALREADY_TEAM_MEMBER"}}
      assert_no_emails_delivered(timeout: 10)
    end

    @tag :as_inserted_user
    test "returns not found for malformed team ids", %{conn: conn, jwt: jwt} do
      response =
        conn
        |> authenticate(jwt)
        |> post(Routes.team_invitation_path(conn, :create, "not-a-uuid"),
          invitation: %{email: "invitee@example.com"}
        )
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
    end
  end

  describe "delete/3" do
    @tag :as_inserted_user
    test "cancels a pending invitation", %{conn: conn, jwt: jwt, team: team, user: user} do
      invitation = insert_invitation(team, inviter: user, email: "cancel-me@example.com")

      conn
      |> authenticate(jwt)
      |> delete(Routes.team_invitation_path(conn, :delete, team.id, invitation.id))
      |> response(204)

      assert Repo.get!(TeamInvitation, invitation.id).status == :cancelled
    end

    @tag :as_inserted_user
    test "does not overwrite an accepted invitation with cancellation", %{
      conn: conn,
      jwt: jwt,
      team: team,
      user: inviter
    } do
      invitee = insert(:user, email: "accepted-before-cancel@example.com")
      {:ok, invitee_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(invitee)
      invitation = insert_invitation(team, inviter: inviter, email: invitee.email)

      conn
      |> authenticate(invitee_jwt)
      |> post(Routes.team_invitation_acceptance_path(conn, :accept, invitation.token))
      |> json_response(200)

      response =
        conn
        |> authenticate(jwt)
        |> delete(Routes.team_invitation_path(conn, :delete, team.id, invitation.id))
        |> json_response(400)

      assert response == %{"error" => %{"code" => 400, "type" => "INVALID_OR_EXPIRED_TOKEN"}}
      assert Repo.get!(TeamInvitation, invitation.id).status == :accepted
    end

    @tag :as_inserted_user
    test "returns not found for malformed invitation ids", %{conn: conn, jwt: jwt, team: team} do
      response =
        conn
        |> authenticate(jwt)
        |> delete(Routes.team_invitation_path(conn, :delete, team.id, "not-a-uuid"))
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
    end
  end

  describe "accept/3" do
    @tag :as_inserted_user
    test "accepts an invitation for an existing user", %{conn: conn, team: team, user: inviter} do
      invitee = insert(:user, email: "existing-accept@example.com")
      {:ok, invitee_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(invitee)
      invitation = insert_invitation(team, inviter: inviter, email: invitee.email)

      response =
        conn
        |> authenticate(invitee_jwt)
        |> post(Routes.team_invitation_acceptance_path(conn, :accept, invitation.token))
        |> json_response(200)

      assert response["data"]["id"] == invitation.id
      assert response["data"]["status"] == "accepted"

      assert Repo.get_by!(Membership, user_id: invitee.id, team_id: team.id).is_billing_account ==
               false

      invitation = Repo.get!(TeamInvitation, invitation.id)
      assert invitation.status == :accepted
      assert invitation.accepted_at
    end

    @tag :as_inserted_user
    test "accepts an invitation for a user created after the invitation", %{
      conn: conn,
      team: team,
      user: inviter
    } do
      invitation = insert_invitation(team, inviter: inviter, email: "new-accept@example.com")
      invitee = insert(:user, email: "new-accept@example.com")
      {:ok, invitee_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(invitee)

      response =
        conn
        |> authenticate(invitee_jwt)
        |> post(Routes.team_invitation_acceptance_path(conn, :accept, invitation.token))
        |> json_response(200)

      assert response["data"]["status"] == "accepted"
      assert Repo.get_by!(Membership, user_id: invitee.id, team_id: team.id)
    end

    @tag :as_inserted_user
    test "rejects expired invitations", %{conn: conn, team: team, user: inviter} do
      invitee = insert(:user, email: "expired-invitee@example.com")
      {:ok, invitee_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(invitee)

      invitation =
        insert_invitation(team,
          inviter: inviter,
          email: invitee.email,
          expires_at: DateTime.add(DateTime.utc_now(), -1, :day)
        )

      response =
        conn
        |> authenticate(invitee_jwt)
        |> post(Routes.team_invitation_acceptance_path(conn, :accept, invitation.token))
        |> json_response(400)

      assert response == %{"error" => %{"code" => 400, "type" => "INVALID_OR_EXPIRED_TOKEN"}}
      refute Repo.get_by(Membership, user_id: invitee.id, team_id: team.id)
      assert Repo.get!(TeamInvitation, invitation.id).status == :pending
    end

    @tag :as_inserted_user
    test "rejects wrong-recipient access", %{conn: conn, team: team, user: inviter} do
      invitee = insert(:user, email: "right-recipient@example.com")
      wrong_user = insert(:user, email: "wrong-recipient@example.com")
      {:ok, wrong_user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(wrong_user)
      invitation = insert_invitation(team, inviter: inviter, email: invitee.email)

      response =
        conn
        |> authenticate(wrong_user_jwt)
        |> post(Routes.team_invitation_acceptance_path(conn, :accept, invitation.token))
        |> json_response(403)

      assert response == %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}
      refute Repo.get_by(Membership, user_id: wrong_user.id, team_id: team.id)
      assert Repo.get!(TeamInvitation, invitation.id).status == :pending
    end
  end

  describe "TeamInvitationEmail.perform/1" do
    @tag :as_inserted_user
    test "does not send cancelled, accepted, or expired invitations", %{team: team, user: inviter} do
      cancelled_invitation =
        insert_invitation(team, inviter: inviter, email: "cancelled-job@example.com")
        |> TeamInvitation.cancel_changeset()
        |> Repo.update!()

      accepted_invitation =
        insert_invitation(team, inviter: inviter, email: "accepted-job@example.com")
        |> TeamInvitation.accept_changeset(DateTime.utc_now())
        |> Repo.update!()

      expired_invitation =
        insert_invitation(team,
          inviter: inviter,
          email: "expired-job@example.com",
          expires_at: DateTime.add(DateTime.utc_now(), -1, :day)
        )

      Enum.each([cancelled_invitation, accepted_invitation, expired_invitation], fn invitation ->
        assert :ok =
                 TeamInvitationEmail.perform(%Oban.Job{
                   args: %{"invitation_id" => invitation.id}
                 })
      end)

      assert_no_emails_delivered(timeout: 10)
    end

    @tag :as_inserted_user
    test "sends pending invitations without raw token job args", %{team: team, user: inviter} do
      invitation = insert_invitation(team, inviter: inviter, email: "pending-job@example.com")

      assert :ok =
               TeamInvitationEmail.perform(%Oban.Job{
                 args: %{"invitation_id" => invitation.id}
               })

      assert_delivered_email_matches(%{
        to: [{_, "pending-job@example.com"}],
        subject: "You have been invited to Form Delegate",
        text_body: text_body
      })

      [_, raw_token] = Regex.run(~r/token=([^\s]+)/, text_body)

      assert raw_token == TeamInvitation.token(invitation)

      assert TeamInvitation.token_digest(raw_token) ==
               Repo.get!(TeamInvitation, invitation.id).token_digest
    end
  end

  defp insert_invitation(team, attrs) do
    inviter = Keyword.fetch!(attrs, :inviter)
    email = Keyword.fetch!(attrs, :email)
    expires_at = Keyword.get(attrs, :expires_at)

    attrs =
      %{
        team_id: team.id,
        inviter_id: inviter.id,
        email: email
      }

    %TeamInvitation{}
    |> TeamInvitation.create_changeset(attrs)
    |> Repo.insert!()
    |> maybe_update_expires_at(expires_at)
    |> with_token()
    |> Repo.preload([:team, :inviter])
  end

  defp maybe_update_expires_at(invitation, nil), do: invitation

  defp maybe_update_expires_at(invitation, expires_at) do
    invitation
    |> Ecto.Changeset.change(expires_at: expires_at)
    |> Repo.update!()
  end

  defp with_token(invitation) do
    %{invitation | token: TeamInvitation.token(invitation)}
  end

  defp authenticate(conn, jwt) do
    conn = %{conn | assigns: Map.delete(conn.assigns, :current_user)}
    put_req_header(conn, "authorization", "bearer: " <> jwt)
  end
end
