defmodule FormDelegateWeb.TeamControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Repo
  alias FormDelegate.Teams.Team
  alias FormDelegateWeb.Router.Helpers, as: Routes

  setup %{conn: conn, user: user} do
    jwt =
      case FormDelegateWeb.Guardian.encode_and_sign(user) do
        {:ok, jwt, _full_claims} -> jwt
        _ -> nil
      end

    {:ok, conn: put_req_header(conn, "accept", "application/json"), jwt: jwt}
  end

  describe "update/3" do
    @tag :as_inserted_user
    test "renames a team for a billing member", %{conn: conn, jwt: jwt, team: team} do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(Routes.team_path(conn, :update, team.id), team: %{name: "Operations"})
        |> json_response(200)

      assert response["data"]["id"] == team.id
      assert response["data"]["name"] == "Operations"
      assert Repo.get!(Team, team.id).name == "Operations"
    end

    @tag :as_inserted_user
    test "does not update stripe customer id", %{conn: conn, jwt: jwt, team: team} do
      original_stripe_customer_id = "cus_original"

      team
      |> Team.changeset(%{stripe_customer_id: original_stripe_customer_id})
      |> Repo.update!()

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(Routes.team_path(conn, :update, team.id),
          team: %{name: "Operations", stripe_customer_id: "cus_replaced"}
        )
        |> json_response(200)

      assert response["data"]["name"] == "Operations"
      assert response["data"]["stripe_customer_id"] == original_stripe_customer_id

      team = Repo.get!(Team, team.id)
      assert team.name == "Operations"
      assert team.stripe_customer_id == original_stripe_customer_id
    end

    @tag :as_inserted_user
    test "rejects a non-admin team member", %{
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
        |> patch(Routes.team_path(conn, :update, team.id), team: %{name: "Operations"})
        |> json_response(403)

      assert response == %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}
      refute Repo.get!(Team, team.id).name == "Operations"
    end

    @tag :as_inserted_user
    test "returns not found for cross-team access", %{conn: conn, jwt: jwt} do
      other_team = insert(:team, name: "Other Team")

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(Routes.team_path(conn, :update, other_team.id), team: %{name: "Operations"})
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
      assert Repo.get!(Team, other_team.id).name == "Other Team"
    end

    @tag :as_inserted_user
    test "returns not found for malformed team ids", %{conn: conn, jwt: jwt} do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(Routes.team_path(conn, :update, "not-a-uuid"), team: %{name: "Operations"})
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
    end

    @tag :as_inserted_admin
    test "allows global admins to update teams they do not belong to", %{conn: conn, jwt: jwt} do
      other_team = insert(:team, name: "Other Team")

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(Routes.team_path(conn, :update, other_team.id), team: %{name: "Operations"})
        |> json_response(200)

      assert response["data"]["id"] == other_team.id
      assert response["data"]["name"] == "Operations"
      assert Repo.get!(Team, other_team.id).name == "Operations"
    end

    @tag :as_inserted_admin
    test "returns not found for malformed team ids as a global admin", %{conn: conn, jwt: jwt} do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> patch(Routes.team_path(conn, :update, "not-a-uuid"), team: %{name: "Operations"})
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
