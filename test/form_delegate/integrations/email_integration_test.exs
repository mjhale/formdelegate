defmodule FormDelegate.Integrations.EmailIntegrationTest do
  use FormDelegate.DataCase, async: true

  alias FormDelegate.Integrations.EmailIntegration

  describe "changeset/2" do
    test "requires provider configuration when enabled" do
      attrs = %{
        "enabled" => true
      }

      changeset = EmailIntegration.changeset(%EmailIntegration{}, attrs)

      refute changeset.valid?

      errors = errors_on(changeset)
      assert "can't be blank" in errors.email_provider
      assert "can't be blank" in errors.email_provider_config
      assert "can't be blank" in errors.email_provider_secrets
      assert "must include at least one 'to' recipient" in errors.email_integration_recipients
    end

    test "requires provider-specific keys" do
      attrs = %{
        "enabled" => true,
        "email_provider" => "postmark",
        "email_provider_config" => %{"from_address" => "alerts@example.com"},
        "email_provider_secrets" => %{},
        "email_provider_status" => "verified",
        "email_integration_recipients" => [
          %{
            "email" => "owner@example.com",
            "type" => "to"
          }
        ]
      }

      changeset = EmailIntegration.changeset(%EmailIntegration{}, attrs)
      refute changeset.valid?

      errors = errors_on(changeset)
      assert "missing required keys: message_stream" in errors.email_provider_config
      assert "missing required keys: server_token" in errors.email_provider_secrets
    end

    test "is valid when enabled with complete provider data" do
      attrs = %{
        "enabled" => true,
        "email_provider" => "smtp",
        "email_provider_config" => %{
          "host" => "smtp.example.com",
          "port" => 587,
          "username" => "mailer@example.com",
          "from_address" => "mailer@example.com"
        },
        "email_provider_secrets" => %{
          "password" => "secret"
        },
        "email_provider_status" => "pending_verification",
        "verify_provider" => true,
        "email_integration_recipients" => [
          %{
            "email" => "owner@example.com",
            "type" => "to"
          }
        ]
      }

      changeset = EmailIntegration.changeset(%EmailIntegration{}, attrs)
      assert changeset.valid?
    end

    test "rejects direct status changes to verified" do
      attrs = %{
        "enabled" => true,
        "email_provider" => "smtp",
        "email_provider_config" => %{
          "host" => "smtp.example.com",
          "port" => 587,
          "username" => "mailer@example.com",
          "from_address" => "mailer@example.com"
        },
        "email_provider_secrets" => %{
          "password" => "secret"
        },
        "email_provider_status" => "verified",
        "email_integration_recipients" => [
          %{
            "email" => "owner@example.com",
            "type" => "to"
          }
        ]
      }

      changeset = EmailIntegration.changeset(%EmailIntegration{}, attrs)
      refute changeset.valid?

      errors = errors_on(changeset)
      assert "cannot be set directly" in errors.email_provider_status
    end

    test "does not require provider fields while disabled" do
      changeset = EmailIntegration.changeset(%EmailIntegration{}, %{"enabled" => false})
      assert changeset.valid?
    end
  end
end
