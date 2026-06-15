defmodule FormDelegateWeb.StripeControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.Repo
  alias FormDelegate.Teams.Team
  alias FormDelegate.Memberships.Membership
  alias FormDelegate.Plans.Plan
  alias FormDelegate.Subscriptions
  alias FormDelegateWeb.StripeHandler
  alias FormDelegateWeb.Router.Helpers, as: Routes

  setup %{conn: conn} do
    # Create a team
    team = Repo.insert!(%Team{name: "Test Team"})
    other_team = Repo.insert!(%Team{name: "Other Team"})

    # Create plan
    plan =
      Repo.insert!(%Plan{
        id: "7682f531-e326-4e00-9691-99858e6f5aaa",
        name: "Professional",
        limit_submissions: 5000,
        limit_forms: 0,
        limit_storage: 10_000_000,
        stripe_product_id: "prod_JqNR8AZx7ESoF8I",
        stripe_price_id: "price_1JqNR8AZx7ESoF8IrQIAiTGr"
      })

    password_hash = Pbkdf2.hash_pwd_salt("password123")

    # Create users: one with billing access, one without
    billing_user =
      FormDelegate.Factory.build(:user,
        name: "Billing Mgr",
        email: "billing@test.com",
        password_hash: password_hash
      )
      |> Repo.insert!()

    normal_user =
      FormDelegate.Factory.build(:user,
        name: "Normal User",
        email: "normal@test.com",
        password_hash: password_hash
      )
      |> Repo.insert!()

    # Create membership for billing user
    Repo.insert!(%Membership{
      user_id: billing_user.id,
      team_id: team.id,
      is_billing_account: true
    })

    Repo.insert!(%Membership{
      user_id: billing_user.id,
      team_id: other_team.id,
      is_billing_account: false
    })

    # Create membership for normal user (is_billing_account is false by default)
    Repo.insert!(%Membership{
      user_id: normal_user.id,
      team_id: team.id,
      is_billing_account: false
    })

    billing_user = Repo.preload(billing_user, memberships: [team: [subscriptions: [:plan]]])
    normal_user = Repo.preload(normal_user, memberships: [team: [subscriptions: [:plan]]])

    {:ok, billing_jwt, _} = FormDelegateWeb.Guardian.encode_and_sign(billing_user)
    {:ok, normal_jwt, _} = FormDelegateWeb.Guardian.encode_and_sign(normal_user)

    {:ok,
     conn: conn,
     team: team,
     other_team: other_team,
     plan: plan,
     billing_user: billing_user,
     normal_user: normal_user,
     billing_jwt: billing_jwt,
     normal_jwt: normal_jwt}
  end

  describe "POST /v1/stripe/checkout-sessions" do
    test "creates checkout session for billing manager", %{
      conn: conn,
      billing_jwt: jwt,
      plan: plan
    } do
      conn =
        conn
        |> put_req_header("authorization", "bearer " <> jwt)
        |> post(Routes.stripe_checkout_session_path(conn, :create_checkout_session), %{
          "priceId" => plan.stripe_price_id
        })

      assert json_response(conn, 200)["id"] == "cs_mock123"
    end

    test "creates team-scoped checkout session for billing manager", %{
      conn: conn,
      billing_jwt: jwt,
      team: team,
      plan: plan
    } do
      conn =
        conn
        |> put_req_header("authorization", "bearer " <> jwt)
        |> post(Routes.team_stripe_checkout_session_path(conn, :create_checkout_session, team), %{
          "priceId" => plan.stripe_price_id
        })

      assert json_response(conn, 200)["id"] == "cs_mock123"
    end

    test "returns 403 for team-scoped checkout when user is not billing account for selected team",
         %{
           conn: conn,
           billing_jwt: jwt,
           other_team: other_team,
           plan: plan
         } do
      conn =
        conn
        |> put_req_header("authorization", "bearer " <> jwt)
        |> post(
          Routes.team_stripe_checkout_session_path(conn, :create_checkout_session, other_team),
          %{
            "priceId" => plan.stripe_price_id
          }
        )

      assert json_response(conn, 403)
    end

    test "returns 403 for user without billing access", %{
      conn: conn,
      normal_jwt: jwt,
      plan: plan
    } do
      conn =
        conn
        |> put_req_header("authorization", "bearer " <> jwt)
        |> post(Routes.stripe_checkout_session_path(conn, :create_checkout_session), %{
          "priceId" => plan.stripe_price_id
        })

      assert json_response(conn, 403)
    end
  end

  describe "GET /v1/stripe/portal" do
    test "redirects to billing portal for billing manager", %{
      conn: conn,
      billing_jwt: jwt
    } do
      conn =
        conn
        |> put_req_header("authorization", "bearer " <> jwt)
        |> get(Routes.stripe_portal_path(conn, :create_portal))

      assert json_response(conn, 200)["url"] == "https://billing.stripe.com/mock"
    end

    test "opens team-scoped billing portal for billing manager", %{
      conn: conn,
      billing_jwt: jwt,
      team: team
    } do
      conn =
        conn
        |> put_req_header("authorization", "bearer " <> jwt)
        |> get(Routes.team_stripe_portal_path(conn, :create_portal, team))

      assert json_response(conn, 200)["url"] == "https://billing.stripe.com/mock"
    end

    test "returns 403 for team-scoped billing portal when user is not billing account for selected team",
         %{
           conn: conn,
           billing_jwt: jwt,
           other_team: other_team
         } do
      conn =
        conn
        |> put_req_header("authorization", "bearer " <> jwt)
        |> get(Routes.team_stripe_portal_path(conn, :create_portal, other_team))

      assert json_response(conn, 403)
    end

    test "returns 403 for user without billing access", %{
      conn: conn,
      normal_jwt: jwt
    } do
      conn =
        conn
        |> put_req_header("authorization", "bearer " <> jwt)
        |> get(Routes.stripe_portal_path(conn, :create_portal))

      assert json_response(conn, 403)
    end
  end

  describe "Stripe Webhook Handler" do
    test "customer.subscription.created creates a subscription", %{team: team, plan: plan} do
      event = %Stripe.Event{
        type: "customer.subscription.created",
        data: %{
          object: %Stripe.Subscription{
            id: "sub_test123",
            status: "active",
            metadata: %{"team_id" => team.id},
            items: %Stripe.List{
              data: [
                %Stripe.SubscriptionItem{
                  plan: %Stripe.Plan{
                    product: plan.stripe_product_id
                  }
                }
              ]
            }
          }
        }
      }

      assert :ok == StripeHandler.handle_event(event)

      sub = Subscriptions.get_subscription!("sub_test123")
      assert sub.stripe_subscription_status == "active"
      assert sub.team_id == team.id
      assert sub.plan_id == plan.id
    end

    test "customer.subscription.created is idempotent after another event creates the subscription",
         %{
           team: team,
           plan: plan
         } do
      updated_event = %Stripe.Event{
        type: "customer.subscription.updated",
        data: %{
          object: %Stripe.Subscription{
            id: "sub_test123",
            status: "active",
            current_period_end: 1_800_000_000,
            metadata: %{"team_id" => team.id},
            items: %Stripe.List{
              data: [
                %Stripe.SubscriptionItem{
                  plan: %Stripe.Plan{
                    product: plan.stripe_product_id
                  }
                }
              ]
            }
          }
        }
      }

      created_event = %Stripe.Event{
        type: "customer.subscription.created",
        data: %{
          object: %Stripe.Subscription{
            id: "sub_test123",
            status: "active",
            metadata: %{"team_id" => team.id},
            items: %Stripe.List{
              data: [
                %Stripe.SubscriptionItem{
                  plan: %Stripe.Plan{
                    product: plan.stripe_product_id
                  }
                }
              ]
            }
          }
        }
      }

      assert :ok == StripeHandler.handle_event(updated_event)
      assert :ok == StripeHandler.handle_event(created_event)

      sub = Subscriptions.get_subscription!("sub_test123")
      assert sub.stripe_subscription_status == "active"
      assert sub.team_id == team.id
      assert sub.plan_id == plan.id
    end

    test "customer.subscription.deleted deletes the subscription", %{team: team, plan: plan} do
      # Pre-create subscription
      {:ok, sub} =
        Subscriptions.create_subscription(%{
          stripe_subscription_id: "sub_test123",
          stripe_subscription_status: "active",
          team_id: team.id,
          plan_id: plan.id
        })

      event = %Stripe.Event{
        type: "customer.subscription.deleted",
        data: %{
          object: %Stripe.Subscription{
            id: sub.stripe_subscription_id
          }
        }
      }

      assert :ok == StripeHandler.handle_event(event)
      assert nil == Subscriptions.get_subscription("sub_test123")
    end
  end
end
