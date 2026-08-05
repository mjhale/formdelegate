defmodule FormDelegateWeb.FormEmailIntegrationControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Integrations.EmailProviders.SMTPClient
  alias FormDelegate.Repo
  alias FormDelegateWeb.Router.Helpers, as: Routes

  defmodule SMTPClientSuccess do
    @behaviour SMTPClient

    @impl true
    def verify(_params), do: :ok
  end

  defmodule SMTPClientFailure do
    @behaviour SMTPClient

    @impl true
    def verify(_params), do: {:error, "invalid SMTP credentials"}
  end

  defmodule SMTPClientConnectionFailure do
    @behaviour SMTPClient

    @impl true
    def verify(_params), do: {:error, "smtp connection failed: timeout"}
  end

  defmodule SMTPClientConfigFailure do
    @behaviour SMTPClient

    @impl true
    def verify(_params), do: {:error, "provider configuration is invalid"}
  end

  defmodule SMTPClientAuthMethodFailure do
    @behaviour SMTPClient

    @impl true
    def verify(_params), do: {:error, "smtp server does not support AUTH PLAIN/LOGIN"}
  end

  defmodule SMTPClientUnknownFailure do
    @behaviour SMTPClient

    @impl true
    def verify(_params), do: {:error, "some unexpected failure"}
  end

  setup %{conn: conn, user: user} do
    previous_smtp_client = Application.get_env(:form_delegate, :email_provider_smtp_client)
    Application.put_env(:form_delegate, :email_provider_smtp_client, SMTPClientSuccess)

    on_exit(fn ->
      if previous_smtp_client do
        Application.put_env(:form_delegate, :email_provider_smtp_client, previous_smtp_client)
      else
        Application.delete_env(:form_delegate, :email_provider_smtp_client)
      end
    end)

    jwt =
      case FormDelegateWeb.Guardian.encode_and_sign(user) do
        {:ok, jwt, _full_claims} ->
          jwt

        _ ->
          nil
      end

    {:ok, conn: put_req_header(conn, "accept", "application/json"), jwt: jwt}
  end

  describe "verify/3" do
    @tag :as_inserted_user
    test "verifies provider and returns updated status fields", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_email_integration_path(conn, :verify, form.id, integration.id))
        |> json_response(200)

      assert response["data"]["id"] == integration.id
      assert response["data"]["email_provider_status"] == "verified"
      assert response["data"]["email_provider_last_verified_at"] != nil

      reloaded = Repo.get!(EmailIntegration, integration.id)
      assert reloaded.email_provider_status == :verified
      assert %DateTime{} = reloaded.email_provider_last_verified_at
    end

    @tag :as_inserted_user
    test "verifies provider through the team-scoped route", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(
          Routes.team_form_email_integration_path(
            conn,
            :verify,
            team.id,
            form.id,
            integration.id
          )
        )
        |> json_response(200)

      assert response["data"]["id"] == integration.id
      assert response["data"]["email_provider_status"] == "verified"
      assert response["data"]["email_provider_last_verified_at"] != nil
    end

    @tag :as_inserted_user
    test "returns forbidden for the team-scoped route when selected team does not own form", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      other_team = FormDelegate.Factory.insert(:team)

      FormDelegate.Repo.insert!(%FormDelegate.Memberships.Membership{
        user_id: user.id,
        team_id: other_team.id,
        is_billing_account: true
      })

      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(
          Routes.team_form_email_integration_path(
            conn,
            :verify,
            other_team.id,
            form.id,
            integration.id
          )
        )
        |> json_response(403)

      assert response == %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}

      reloaded = Repo.get!(EmailIntegration, integration.id)
      assert reloaded.email_provider_status == :unconfigured
      assert reloaded.email_provider_last_verified_at == nil
    end

    @tag :as_inserted_user
    test "returns forbidden for non-owner", %{conn: conn, jwt: jwt} do
      {owner, owner_team, _membership} = FormDelegate.Factory.insert_user_with_membership()
      form = FormDelegate.Factory.insert(:form, user: owner, team: owner_team)
      integration = insert_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_email_integration_path(conn, :verify, form.id, integration.id))
        |> json_response(403)

      assert response == %{"error" => %{"code" => 403, "type" => "FORBIDDEN"}}
    end

    @tag :as_inserted_user
    test "returns not found when integration does not belong to form", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(
          Routes.form_email_integration_path(
            conn,
            :verify,
            form.id,
            "55555555-5555-5555-5555-555555555555"
          )
        )
        |> json_response(404)

      assert response == %{"error" => %{"code" => 404, "type" => "PAGE_NOT_FOUND"}}
    end

    @tag :as_inserted_user
    test "returns typed verification failure for invalid credentials", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      Application.put_env(:form_delegate, :email_provider_smtp_client, SMTPClientFailure)
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_email_integration_path(conn, :verify, form.id, integration.id))
        |> json_response(400)

      assert response == %{
               "error" => %{
                 "code" => 400,
                 "type" => "EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CREDENTIALS"
               }
             }
    end

    @tag :as_inserted_user
    test "returns unsupported provider for unconfigured integration", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_unconfigured_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_email_integration_path(conn, :verify, form.id, integration.id))
        |> json_response(400)

      assert response == %{
               "error" => %{
                 "code" => 400,
                 "type" => "UNSUPPORTED_EMAIL_PROVIDER"
               }
             }
    end

    @tag :as_inserted_user
    test "returns typed verification failure for connection errors", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      Application.put_env(
        :form_delegate,
        :email_provider_smtp_client,
        SMTPClientConnectionFailure
      )

      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_email_integration_path(conn, :verify, form.id, integration.id))
        |> json_response(400)

      assert response == %{
               "error" => %{
                 "code" => 400,
                 "type" => "EMAIL_PROVIDER_VERIFICATION_FAILED_CONNECTION_FAILED"
               }
             }
    end

    @tag :as_inserted_user
    test "returns typed verification failure for invalid configuration", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      Application.put_env(:form_delegate, :email_provider_smtp_client, SMTPClientConfigFailure)
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_email_integration_path(conn, :verify, form.id, integration.id))
        |> json_response(400)

      assert response == %{
               "error" => %{
                 "code" => 400,
                 "type" => "EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CONFIGURATION"
               }
             }
    end

    @tag :as_inserted_user
    test "returns typed verification failure for unsupported auth method", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      Application.put_env(
        :form_delegate,
        :email_provider_smtp_client,
        SMTPClientAuthMethodFailure
      )

      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_email_integration_path(conn, :verify, form.id, integration.id))
        |> json_response(400)

      assert response == %{
               "error" => %{
                 "code" => 400,
                 "type" => "EMAIL_PROVIDER_VERIFICATION_FAILED_UNSUPPORTED_AUTH_METHOD"
               }
             }
    end

    @tag :as_inserted_user
    test "returns typed verification failure for unknown errors", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      Application.put_env(:form_delegate, :email_provider_smtp_client, SMTPClientUnknownFailure)
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_email_integration(form)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_email_integration_path(conn, :verify, form.id, integration.id))
        |> json_response(400)

      assert response == %{
               "error" => %{
                 "code" => 400,
                 "type" => "EMAIL_PROVIDER_VERIFICATION_FAILED_UNKNOWN"
               }
             }
    end
  end

  describe "without logged in user" do
    test "requires user authentication", %{conn: conn} do
      conn
      |> post(
        Routes.form_email_integration_path(
          conn,
          :verify,
          "55555555-5555-5555-5555-555555555555",
          "55555555-5555-5555-5555-555555555555"
        )
      )
      |> json_response(401)
    end
  end

  defp insert_email_integration(form) do
    %EmailIntegration{}
    |> EmailIntegration.changeset(%{
      "enabled" => false,
      "form_id" => form.id,
      "email_provider" => "smtp",
      "email_provider_config" => %{
        "host" => "smtp.example.com",
        "port" => 587,
        "username" => "mailer@example.com",
        "from_address" => "mailer@example.com"
      },
      "email_provider_secrets" => %{"password" => "secret"},
      "email_integration_recipients" => [
        %{"email" => "owner@example.com", "type" => "to"}
      ]
    })
    |> Repo.insert!()
  end

  defp insert_unconfigured_email_integration(form) do
    %EmailIntegration{}
    |> EmailIntegration.changeset(%{
      "enabled" => false,
      "form_id" => form.id
    })
    |> Repo.insert!()
  end
end
