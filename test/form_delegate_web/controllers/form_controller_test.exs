defmodule FormDelegateWeb.FormControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.BillingCounts
  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Integrations.EmailProviders.SMTPClient
  alias FormDelegate.Repo
  alias FormDelegate.Submissions.Attachment
  alias FormDelegateWeb.Router.Helpers, as: Routes

  @valid_attrs %{name: "Contact Form"}
  @update_attrs %{hosts: ["example.com"], name: "Report Form"}
  @invalid_attrs %{name: nil}

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
    conn = Plug.Conn.assign(conn, :current_user, user)

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

  describe "index/2" do
    @tag :as_inserted_user
    test "Responds with with all user forms", %{conn: conn, jwt: jwt, user: user, team: team} do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.form_path(conn, :index))
        |> json_response(200)

      expected = %{
        "data" => [
          %{
            "callback_success_includes_data" => false,
            "callback_success_url" => nil,
            "email_integrations" => [],
            "hosts" => nil,
            "id" => form.id,
            "inserted_at" => DateTime.to_iso8601(form.inserted_at),
            "name" => form.name,
            "submission_source_policy" => "unrestricted",
            "submission_count" => 0,
            "updated_at" => DateTime.to_iso8601(form.updated_at),
            "verified" => false
          }
        ]
      }

      assert response == expected
    end
  end

  describe "create/2" do
    @tag :as_inserted_user
    test "Creates, and responds with a newly created form if attributes are valid", %{
      conn: conn,
      jwt: jwt,
      team: team
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_path(conn, :create), form: @valid_attrs)
        |> json_response(201)

      assert response["data"]["host"] == nil
      assert response["data"]["name"] == "Contact Form"
      assert response["data"]["submission_source_policy"] == "unrestricted"
      assert response["data"]["submission_count"] == 0
      assert response["data"]["verified"] == false

      billing_count = BillingCounts.get_latest_billing_count_of_team(team.id)
      assert billing_count.form_count == 1
    end

    @tag :as_inserted_user
    test "Returns an error and does not create a form if attributes are invalid", %{
      conn: conn,
      jwt: jwt,
      team: team
    } do
      billing_count_before = BillingCounts.get_latest_billing_count_of_team(team.id)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_path(conn, :create), form: @invalid_attrs)
        |> json_response(422)

      expected = %{
        "error" => %{
          "code" => 422,
          "errors" => %{"name" => ["can't be blank"]},
          "type" => "UNPROCESSABLE_ENTITY"
        }
      }

      assert response == expected

      billing_count_after = BillingCounts.get_latest_billing_count_of_team(team.id)
      assert billing_count_after.form_count == billing_count_before.form_count
    end

    @tag :as_inserted_user
    test "rejects a null host entry without creating a form", %{
      conn: conn,
      jwt: jwt,
      team: team
    } do
      billing_count_before = BillingCounts.get_latest_billing_count_of_team(team.id)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_path(conn, :create),
          form: %{name: "Contact Form", hosts: [nil]}
        )
        |> json_response(422)

      assert response["error"]["errors"]["hosts"] == [
               "contains an invalid hostname or wildcard"
             ]

      billing_count_after = BillingCounts.get_latest_billing_count_of_team(team.id)
      assert billing_count_after.form_count == billing_count_before.form_count
    end

    @tag :as_inserted_user
    test "creates and verifies email integrations marked pending_verification", %{
      conn: conn,
      jwt: jwt
    } do
      attrs = %{
        name: "Contact Form",
        email_integrations: [
          %{
            enabled: true,
            email_provider: "smtp",
            email_provider_status: "pending_verification",
            verify_provider: true,
            email_provider_config: %{
              host: "smtp.example.com",
              port: 587,
              username: "mailer@example.com",
              from_address: "mailer@example.com"
            },
            email_provider_secrets: %{
              password: "secret"
            },
            email_integration_recipients: [
              %{email: "owner@example.com", type: "to"}
            ]
          }
        ]
      }

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_path(conn, :create), form: attrs)
        |> json_response(201)

      [integration] = response["data"]["email_integrations"]
      assert integration["email_provider_status"] == "verified"
      assert integration["email_provider_last_verified_at"] != nil
    end

    @tag :as_inserted_user
    test "returns verification error and rolls back create when provider check fails", %{
      conn: conn,
      jwt: jwt,
      team: team
    } do
      Application.put_env(:form_delegate, :email_provider_smtp_client, SMTPClientFailure)
      form_count_before = Repo.aggregate(Form, :count, :id)
      billing_count_before = BillingCounts.get_latest_billing_count_of_team(team.id)

      attrs = %{
        name: "Contact Form",
        email_integrations: [
          %{
            enabled: true,
            email_provider: "smtp",
            email_provider_status: "pending_verification",
            verify_provider: true,
            email_provider_config: %{
              host: "smtp.example.com",
              port: 587,
              username: "mailer@example.com",
              from_address: "mailer@example.com"
            },
            email_provider_secrets: %{
              password: "secret"
            },
            email_integration_recipients: [
              %{email: "owner@example.com", type: "to"}
            ]
          }
        ]
      }

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_path(conn, :create), form: attrs)
        |> json_response(400)

      assert response == %{
               "error" => %{
                 "code" => 400,
                 "type" => "EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CREDENTIALS"
               }
             }

      form_count_after = Repo.aggregate(Form, :count, :id)
      assert form_count_after == form_count_before

      billing_count_after = BillingCounts.get_latest_billing_count_of_team(team.id)
      assert billing_count_after.form_count == billing_count_before.form_count
    end

    @tag :as_inserted_user
    test "returns typed verification failure codes for classified provider errors", %{
      conn: conn,
      jwt: jwt
    } do
      cases = [
        {SMTPClientConnectionFailure, "EMAIL_PROVIDER_VERIFICATION_FAILED_CONNECTION_FAILED"},
        {SMTPClientConfigFailure, "EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CONFIGURATION"},
        {SMTPClientAuthMethodFailure,
         "EMAIL_PROVIDER_VERIFICATION_FAILED_UNSUPPORTED_AUTH_METHOD"},
        {SMTPClientUnknownFailure, "EMAIL_PROVIDER_VERIFICATION_FAILED_UNKNOWN"}
      ]

      Enum.each(cases, fn {smtp_client_module, expected_type} ->
        Application.put_env(:form_delegate, :email_provider_smtp_client, smtp_client_module)

        response =
          conn
          |> recycle()
          |> put_req_header("accept", "application/json")
          |> put_req_header("authorization", "bearer: " <> jwt)
          |> post(Routes.form_path(conn, :create), form: build_form_create_attrs())
          |> json_response(400)

        assert response == %{
                 "error" => %{
                   "code" => 400,
                   "type" => expected_type
                 }
               }
      end)
    end
  end

  describe "show/2" do
    @describetag :as_inserted_user

    test "Responds with form info if the form is found", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.form_path(conn, :show, form.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "callback_success_includes_data" => false,
          "callback_success_url" => nil,
          "email_integrations" => [],
          "hosts" => nil,
          "id" => form.id,
          "inserted_at" => DateTime.to_iso8601(form.inserted_at),
          "name" => form.name,
          "submission_source_policy" => "unrestricted",
          "submission_count" => 0,
          "updated_at" => DateTime.to_iso8601(form.updated_at),
          "verified" => false
        }
      }

      assert response == expected
    end

    @tag :as_inserted_user
    test "Responds with an error indicating form not found", %{
      conn: conn,
      jwt: jwt
    } do
      assert_error_sent :not_found, fn ->
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.form_path(conn, :show, "55555555-5555-5555-5555-555555555555"))
      end
    end
  end

  describe "update/2" do
    @tag :as_inserted_user
    test "Edits, and responds with the form if attributes are valid", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.form_path(conn, :update, form.id), form: @update_attrs)
        |> json_response(200)

      assert response["data"]["hosts"] == ["example.com"]
      assert response["data"]["name"] == "Report Form"
      assert response["data"]["submission_source_policy"] == "unrestricted"
      assert response["data"]["submission_count"] == 0
      assert response["data"]["verified"] == false
    end

    @tag :as_inserted_user
    test "normalizes and returns restricted submission source settings", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.form_path(conn, :update, form.id),
          form: %{
            hosts: [" Example.COM. ", "example.com", "*.Example.org"],
            name: form.name,
            submission_source_policy: "restricted"
          }
        )
        |> json_response(200)

      assert response["data"]["hosts"] == ["example.com", "*.example.org"]
      assert response["data"]["submission_source_policy"] == "restricted"
    end

    @tag :as_inserted_user
    test "rejects invalid submission source settings", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.form_path(conn, :update, form.id),
          form: %{
            hosts: ["https://example.com/contact"],
            name: form.name,
            submission_source_policy: "restricted"
          }
        )
        |> json_response(422)

      assert response["error"]["errors"]["hosts"] == [
               "contains an invalid hostname or wildcard"
             ]
    end

    @tag :as_inserted_user
    test "rejects a null host entry without editing the form", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.form_path(conn, :update, form.id),
          form: %{hosts: [nil], name: form.name}
        )
        |> json_response(422)

      assert response["error"]["errors"]["hosts"] == [
               "contains an invalid hostname or wildcard"
             ]

      assert Repo.get!(Form, form.id).hosts == form.hosts
    end

    @tag :as_inserted_user
    test "Returns an error and does not edit the form if attributes are invalid",
         %{
           conn: conn,
           jwt: jwt,
           user: user,
           team: team
         } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)

      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> put(Routes.form_path(conn, :update, form.id), form: @invalid_attrs)
      |> json_response(:unprocessable_entity)
    end

    @tag :as_inserted_user
    test "updates and verifies email integrations marked pending_verification", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      integration = insert_email_integration(form)

      attrs = %{
        name: "Updated Form",
        email_integrations: [
          %{
            id: integration.id,
            enabled: true,
            email_provider: "smtp",
            email_provider_status: "pending_verification",
            verify_provider: true,
            email_provider_config: %{
              host: "smtp.example.com",
              port: 587,
              username: "mailer@example.com",
              from_address: "mailer@example.com"
            },
            email_provider_secrets: %{
              password: "secret"
            },
            email_integration_recipients: [
              %{email: "owner@example.com", type: "to"}
            ]
          }
        ]
      }

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.form_path(conn, :update, form.id), form: attrs)
        |> json_response(200)

      assert response["data"]["name"] == "Updated Form"
      [updated_integration] = response["data"]["email_integrations"]
      assert updated_integration["id"] == integration.id
      assert updated_integration["email_provider_status"] == "verified"
      assert updated_integration["email_provider_last_verified_at"] != nil
    end

    @tag :as_inserted_user
    test "returns verification error and rolls back update when provider check fails", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      Application.put_env(:form_delegate, :email_provider_smtp_client, SMTPClientFailure)

      form = FormDelegate.Factory.insert(:form, user: user, team: team, name: "Original Form")
      integration = insert_email_integration(form)

      attrs = %{
        name: "Should Not Persist",
        email_integrations: [
          %{
            id: integration.id,
            enabled: true,
            email_provider: "smtp",
            email_provider_status: "pending_verification",
            verify_provider: true,
            email_provider_config: %{
              host: "smtp.example.com",
              port: 587,
              username: "mailer@example.com",
              from_address: "mailer@example.com"
            },
            email_provider_secrets: %{
              password: "secret"
            },
            email_integration_recipients: [
              %{email: "owner@example.com", type: "to"}
            ]
          }
        ]
      }

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.form_path(conn, :update, form.id), form: attrs)
        |> json_response(400)

      assert response == %{
               "error" => %{
                 "code" => 400,
                 "type" => "EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CREDENTIALS"
               }
             }

      reloaded_form = Repo.get!(Form, form.id)
      assert reloaded_form.name == "Original Form"

      reloaded_integration = Repo.get!(EmailIntegration, integration.id)
      assert reloaded_integration.enabled == false
      assert reloaded_integration.email_provider_status == :unconfigured
      assert is_nil(reloaded_integration.email_provider_last_verified_at)
    end

    @tag :as_inserted_user
    test "returns typed verification failure codes on update for classified provider errors", %{
      conn: conn,
      jwt: jwt,
      user: user,
      team: team
    } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team, name: "Original Form")
      integration = insert_email_integration(form)

      cases = [
        {SMTPClientConnectionFailure, "EMAIL_PROVIDER_VERIFICATION_FAILED_CONNECTION_FAILED"},
        {SMTPClientConfigFailure, "EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CONFIGURATION"},
        {SMTPClientAuthMethodFailure,
         "EMAIL_PROVIDER_VERIFICATION_FAILED_UNSUPPORTED_AUTH_METHOD"},
        {SMTPClientUnknownFailure, "EMAIL_PROVIDER_VERIFICATION_FAILED_UNKNOWN"}
      ]

      Enum.each(cases, fn {smtp_client_module, expected_type} ->
        Application.put_env(:form_delegate, :email_provider_smtp_client, smtp_client_module)

        response =
          conn
          |> recycle()
          |> put_req_header("accept", "application/json")
          |> put_req_header("authorization", "bearer: " <> jwt)
          |> put(
            Routes.form_path(conn, :update, form.id),
            form: build_form_update_attrs(integration.id, "Should Not Persist")
          )
          |> json_response(400)

        assert response == %{
                 "error" => %{
                   "code" => 400,
                   "type" => expected_type
                 }
               }
      end)
    end
  end

  describe "delete/3" do
    @tag :as_inserted_user
    test "Deletes, and returns a 404 if the form was deleted",
         %{
           conn: conn,
           jwt: jwt,
           user: user,
           team: team
         } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      {:ok, _billing_count} = BillingCounts.reconcile_current_period(team.id)

      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> delete(Routes.form_path(conn, :delete, form.id))
      |> response(204)

      billing_count = BillingCounts.get_latest_billing_count_of_team(team.id)
      assert billing_count.form_count == 0

      assert_error_sent 404, fn ->
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.form_path(conn, :show, form.id))
      end
    end

    @tag :as_inserted_user
    test "decrements stored bytes when deleting a form with attachments",
         %{
           conn: conn,
           jwt: jwt,
           user: user,
           team: team
         } do
      form = FormDelegate.Factory.insert(:form, user: user, team: team)
      submission = FormDelegate.Factory.insert(:submission, form: form)

      Repo.insert!(%Attachment{
        content_type: "text/plain",
        field_name: "upload",
        file_name: "notes.txt",
        file_size: 2048,
        submission_id: submission.id
      })

      {:ok, billing_count} = BillingCounts.reconcile_current_period(team.id)
      assert billing_count.storage_count == 2048

      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> delete(Routes.form_path(conn, :delete, form.id))
      |> response(204)

      billing_count = BillingCounts.get_latest_billing_count_of_team(team.id)
      assert billing_count.storage_count == 0
    end

    test "Returns an error and does not delete the form if other user", %{
      conn: conn
    } do
      {user, user_team, _membership} = FormDelegate.Factory.insert_user_with_membership()
      {:ok, user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(user)
      user_form = FormDelegate.Factory.insert(:form, user: user, team: user_team)

      {other_user, _other_team, _other_membership} =
        FormDelegate.Factory.insert_user_with_membership()

      {:ok, other_user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(other_user)

      conn
      |> put_req_header("authorization", "bearer: " <> other_user_jwt)
      |> delete(Routes.form_path(conn, :delete, user_form.id))
      |> json_response(403)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> user_jwt)
        |> get(Routes.form_path(conn, :show, user_form.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "callback_success_includes_data" => false,
          "callback_success_url" => nil,
          "email_integrations" => [],
          "hosts" => nil,
          "id" => user_form.id,
          "inserted_at" => DateTime.to_iso8601(user_form.inserted_at),
          "name" => user_form.name,
          "submission_source_policy" => "unrestricted",
          "submission_count" => 0,
          "updated_at" => DateTime.to_iso8601(user_form.updated_at),
          "verified" => false
        }
      }

      assert response == expected
    end
  end

  describe "without logged in user" do
    test "requires user authentication on all actions", %{conn: conn} do
      Enum.each(
        [
          get(conn, Routes.form_path(conn, :index)),
          get(conn, Routes.form_path(conn, :show, "1")),
          post(conn, Routes.form_path(conn, :create, %{})),
          put(conn, Routes.form_path(conn, :update, "1", %{})),
          delete(conn, Routes.form_path(conn, :delete, "1"))
        ],
        fn conn ->
          assert json_response(conn, 401)
          assert conn.halted
        end
      )
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

  defp build_form_create_attrs do
    %{
      name: "Contact Form",
      email_integrations: [build_email_integration_attrs()]
    }
  end

  defp build_form_update_attrs(integration_id, form_name) do
    %{
      name: form_name,
      email_integrations: [
        build_email_integration_attrs(%{
          id: integration_id
        })
      ]
    }
  end

  defp build_email_integration_attrs(extra_attrs \\ %{}) do
    Map.merge(
      %{
        enabled: true,
        email_provider: "smtp",
        email_provider_status: "pending_verification",
        verify_provider: true,
        email_provider_config: %{
          host: "smtp.example.com",
          port: 587,
          username: "mailer@example.com",
          from_address: "mailer@example.com"
        },
        email_provider_secrets: %{
          password: "secret"
        },
        email_integration_recipients: [
          %{email: "owner@example.com", type: "to"}
        ]
      },
      extra_attrs
    )
  end
end
