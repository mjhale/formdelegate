defmodule FormDelegateWeb.BillingControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.BillingCounts
  alias FormDelegateWeb.Router.Helpers, as: Routes

  setup %{user: user} do
    {:ok, jwt, _claims} = FormDelegateWeb.Guardian.encode_and_sign(user)
    {:ok, jwt: jwt}
  end

  describe "GET /v1/teams/:team_id/billing/usage" do
    @tag :as_inserted_user
    test "returns current plan, period, and usage counters", %{
      conn: conn,
      jwt: jwt,
      team: team,
      user: user
    } do
      FormDelegate.Factory.insert(:form, user: user, team: team)
      {:ok, _billing_count} = BillingCounts.reconcile_current_period(team.id)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.team_billing_usage_path(conn, :usage, team.id))
        |> json_response(200)

      assert %{
               "data" => %{
                 "team_id" => team_id,
                 "plan" => %{"name" => "Free"},
                 "subscription" => nil,
                 "period" => %{"started_at" => _started_at, "ended_at" => _ended_at},
                 "usage" => %{
                   "forms" => %{"used" => 1, "status" => "unlimited"},
                   "submissions" => %{"used" => 0, "status" => "ok"},
                   "storage" => %{"used_bytes" => 0, "status" => "ok"}
                 }
               }
             } = response

      assert team_id == team.id
    end
  end
end
