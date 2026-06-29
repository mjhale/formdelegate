defmodule FormDelegateWeb.TeamMembershipControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Repo
  alias FormDelegateWeb.Router.Helpers, as: Routes

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
    test "lists team memberships for a billing member", %{
      conn: conn,
      jwt: jwt,
      team: team,
      user: user,
      membership: membership
    } do
      member_membership = add_team_member(team, is_billing_account: false)
      member_user = Repo.preload(member_membership, :user).user

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.team_membership_path(conn, :index, team.id))
        |> json_response(200)

      assert MapSet.new(Enum.map(response["data"], & &1["id"])) ==
               MapSet.new([membership.id, member_membership.id])

      memberships_by_id = Map.new(response["data"], &{&1["id"], &1})

      assert memberships_by_id[membership.id]["user"] == %{
               "id" => user.id,
               "email" => user.email,
               "name" => user.name
             }

      assert memberships_by_id[member_membership.id]["user"] == %{
               "id" => member_user.id,
               "email" => member_user.email,
               "name" => member_user.name
             }
    end

    @tag :as_inserted_user
    test "rejects non-admin team members", %{
      conn: conn,
      jwt: jwt,
      team: team,
      membership: membership
    } do
      add_team_member(team, is_billing_account: true)
      set_billing_account!(membership, false)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.team_membership_path(conn, :index, team.id))
        |> json_response(403)

      assert response == %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}
    end

    @tag :as_inserted_user
    test "returns not found for cross-team access", %{conn: conn, jwt: jwt} do
      other_team = insert(:team)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.team_membership_path(conn, :index, other_team.id))
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
    end

    @tag :as_inserted_user
    test "returns not found for malformed team ids", %{conn: conn, jwt: jwt} do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.team_membership_path(conn, :index, "not-a-uuid"))
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
    end
  end

  describe "update/3" do
    @tag :as_inserted_user
    test "updates a member billing flag for a billing member", %{conn: conn, jwt: jwt, team: team} do
      member_membership = add_team_member(team, is_billing_account: false)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(
          Routes.team_membership_path(conn, :update, team.id, member_membership.id),
          membership: %{is_billing_account: true}
        )
        |> json_response(200)

      assert response["data"]["id"] == member_membership.id
      assert response["data"]["is_billing_account"]
      assert Map.keys(response["data"]["user"]) |> Enum.sort() == ["email", "id", "name"]
      assert Repo.get!(Membership, member_membership.id).is_billing_account
    end

    @tag :as_inserted_user
    test "rejects non-admin team members", %{
      conn: conn,
      jwt: jwt,
      team: team,
      membership: membership
    } do
      admin_membership = add_team_member(team, is_billing_account: true)
      set_billing_account!(membership, false)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(
          Routes.team_membership_path(conn, :update, team.id, admin_membership.id),
          membership: %{is_billing_account: false}
        )
        |> json_response(403)

      assert response == %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}
      assert Repo.get!(Membership, admin_membership.id).is_billing_account
    end

    @tag :as_inserted_user
    test "rejects demoting the final team admin", %{
      conn: conn,
      jwt: jwt,
      team: team,
      membership: membership
    } do
      add_team_member(team, is_billing_account: false)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(
          Routes.team_membership_path(conn, :update, team.id, membership.id),
          membership: %{is_billing_account: false}
        )
        |> json_response(400)

      assert response == %{"error" => %{"code" => 400, "type" => "LAST_TEAM_ADMIN"}}
      assert Repo.get!(Membership, membership.id).is_billing_account
    end

    @tag :as_inserted_user
    test "returns changeset errors for invalid billing flags", %{
      conn: conn,
      jwt: jwt,
      team: team
    } do
      member_membership = add_team_member(team, is_billing_account: false)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(
          Routes.team_membership_path(conn, :update, team.id, member_membership.id),
          membership: %{is_billing_account: nil}
        )
        |> json_response(422)

      assert response == %{
               "error" => %{
                 "code" => 422,
                 "errors" => %{"is_billing_account" => ["can't be blank"]},
                 "type" => "UNPROCESSABLE_ENTITY"
               }
             }
    end

    @tag :as_inserted_user
    test "does not update memberships from another team", %{conn: conn, jwt: jwt, team: team} do
      other_team = insert(:team)
      other_membership = add_team_member(other_team, is_billing_account: false)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(
          Routes.team_membership_path(conn, :update, team.id, other_membership.id),
          membership: %{is_billing_account: true}
        )
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
      refute Repo.get!(Membership, other_membership.id).is_billing_account
    end

    @tag :as_inserted_user
    test "returns not found for malformed team ids", %{
      conn: conn,
      jwt: jwt,
      membership: membership
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(
          Routes.team_membership_path(conn, :update, "not-a-uuid", membership.id),
          membership: %{is_billing_account: false}
        )
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
    end
  end

  describe "delete/3" do
    @tag :as_inserted_user
    test "removes a member for a billing member", %{conn: conn, jwt: jwt, team: team} do
      member_membership = add_team_member(team, is_billing_account: false)

      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> delete(Routes.team_membership_path(conn, :delete, team.id, member_membership.id))
      |> response(204)

      refute Repo.get(Membership, member_membership.id)
    end

    @tag :as_inserted_user
    test "rejects removing the final team member", %{
      conn: conn,
      jwt: jwt,
      team: team,
      membership: membership
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> delete(Routes.team_membership_path(conn, :delete, team.id, membership.id))
        |> json_response(400)

      assert response == %{"error" => %{"code" => 400, "type" => "LAST_TEAM_MEMBER"}}
      assert Repo.get(Membership, membership.id)
    end

    @tag :as_inserted_user
    test "rejects non-admin team members", %{
      conn: conn,
      jwt: jwt,
      team: team,
      membership: membership
    } do
      admin_membership = add_team_member(team, is_billing_account: true)
      set_billing_account!(membership, false)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> delete(Routes.team_membership_path(conn, :delete, team.id, admin_membership.id))
        |> json_response(403)

      assert response == %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}
      assert Repo.get(Membership, admin_membership.id)
    end

    @tag :as_inserted_user
    test "rejects removing the final team admin", %{
      conn: conn,
      jwt: jwt,
      team: team,
      membership: membership
    } do
      add_team_member(team, is_billing_account: false)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> delete(Routes.team_membership_path(conn, :delete, team.id, membership.id))
        |> json_response(400)

      assert response == %{"error" => %{"code" => 400, "type" => "LAST_TEAM_ADMIN"}}
      assert Repo.get(Membership, membership.id)
    end

    @tag :as_inserted_user
    test "does not remove memberships from another team", %{conn: conn, jwt: jwt, team: team} do
      other_team = insert(:team)
      other_membership = add_team_member(other_team, is_billing_account: false)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> delete(Routes.team_membership_path(conn, :delete, team.id, other_membership.id))
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
      assert Repo.get(Membership, other_membership.id)
    end

    @tag :as_inserted_user
    test "returns not found for malformed team ids", %{
      conn: conn,
      jwt: jwt,
      membership: membership
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> delete(Routes.team_membership_path(conn, :delete, "not-a-uuid", membership.id))
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
    end
  end

  defp add_team_member(team, attrs) do
    user = insert(:user)

    Repo.insert!(%Membership{
      user_id: user.id,
      team_id: team.id,
      is_billing_account: Keyword.fetch!(attrs, :is_billing_account)
    })
  end

  defp set_billing_account!(membership, is_billing_account) do
    membership
    |> Membership.billing_account_changeset(%{is_billing_account: is_billing_account})
    |> Repo.update!()
  end
end
