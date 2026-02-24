defmodule FormDelegate.IntegrationsTest do
  use FormDelegate.DataCase, async: true

  alias FormDelegate.Factory
  alias FormDelegate.Integrations
  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Repo

  defmodule SuccessProvider do
    @behaviour FormDelegate.Integrations.EmailProvider

    @impl true
    def verify_credentials(_config, _secrets), do: :ok
  end

  defmodule FailureProvider do
    @behaviour FormDelegate.Integrations.EmailProvider

    @impl true
    def verify_credentials(_config, _secrets), do: {:error, "invalid credentials"}
  end

  defmodule ConnectionFailureProvider do
    @behaviour FormDelegate.Integrations.EmailProvider

    @impl true
    def verify_credentials(_config, _secrets), do: {:error, "smtp connection failed: timeout"}
  end

  defmodule ConfigFailureProvider do
    @behaviour FormDelegate.Integrations.EmailProvider

    @impl true
    def verify_credentials(_config, _secrets), do: {:error, "missing required value: host"}
  end

  defmodule AuthMethodFailureProvider do
    @behaviour FormDelegate.Integrations.EmailProvider

    @impl true
    def verify_credentials(_config, _secrets),
      do: {:error, "smtp server does not support AUTH PLAIN/LOGIN"}
  end

  defmodule UnknownFailureProvider do
    @behaviour FormDelegate.Integrations.EmailProvider

    @impl true
    def verify_credentials(_config, _secrets), do: {:error, "something odd happened"}
  end

  describe "verify_email_integration_provider/2" do
    test "marks integration as verified when provider verification succeeds" do
      integration = insert_email_integration()

      {result, telemetry} =
        capture_verification_event(fn ->
          Integrations.verify_email_integration_provider(integration, %{
            smtp: SuccessProvider
          })
        end)

      assert {:ok, updated} = result

      assert updated.email_provider_status == :verified
      assert %DateTime{} = updated.email_provider_last_verified_at

      assert telemetry.metadata.status == :verified
      assert telemetry.metadata.failure_code == nil
      assert telemetry.metadata.provider == :smtp
      assert telemetry.metadata.integration_id == integration.id
    end

    test "marks integration as invalid when provider verification fails" do
      integration = insert_email_integration()

      {result, telemetry} =
        capture_verification_event(fn ->
          Integrations.verify_email_integration_provider(integration, %{
            smtp: FailureProvider
          })
        end)

      assert {:error, {:verification_failed, "invalid credentials", "INVALID_CREDENTIALS"}} =
               result

      reloaded = Repo.get!(EmailIntegration, integration.id)
      assert reloaded.email_provider_status == :invalid
      assert is_nil(reloaded.email_provider_last_verified_at)

      assert telemetry.metadata.status == :failed
      assert telemetry.metadata.failure_code == "INVALID_CREDENTIALS"
      assert telemetry.metadata.provider == :smtp
      assert telemetry.metadata.integration_id == integration.id
    end

    test "returns unsupported_provider error when module mapping is missing" do
      integration = insert_email_integration()

      assert {:error, {:unsupported_provider, :smtp}} =
               Integrations.verify_email_integration_provider(integration, %{})
    end

    test "classifies connection errors as CONNECTION_FAILED" do
      integration = insert_email_integration()

      assert {:error, {:verification_failed, _reason, "CONNECTION_FAILED"}} =
               Integrations.verify_email_integration_provider(integration, %{
                 smtp: ConnectionFailureProvider
               })
    end

    test "classifies config errors as INVALID_CONFIGURATION" do
      integration = insert_email_integration()

      assert {:error, {:verification_failed, _reason, "INVALID_CONFIGURATION"}} =
               Integrations.verify_email_integration_provider(integration, %{
                 smtp: ConfigFailureProvider
               })
    end

    test "classifies unsupported auth as UNSUPPORTED_AUTH_METHOD" do
      integration = insert_email_integration()

      assert {:error, {:verification_failed, _reason, "UNSUPPORTED_AUTH_METHOD"}} =
               Integrations.verify_email_integration_provider(integration, %{
                 smtp: AuthMethodFailureProvider
               })
    end

    test "classifies unknown failures as UNKNOWN" do
      integration = insert_email_integration()

      assert {:error, {:verification_failed, _reason, "UNKNOWN"}} =
               Integrations.verify_email_integration_provider(integration, %{
                 smtp: UnknownFailureProvider
               })
    end
  end

  defp insert_email_integration do
    form = Factory.insert(:form)

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
      "email_provider_secrets" => %{"password" => "secret"}
    })
    |> Repo.insert!()
  end

  defp capture_verification_event(fun) do
    test_pid = self()
    handler_id = "verification-test-#{System.unique_integer([:positive, :monotonic])}"
    event_name = [:form_delegate, :email_integration, :verification]

    :telemetry.attach(
      handler_id,
      event_name,
      fn event, measurements, metadata, _config ->
        send(test_pid, {:verification_event, event, measurements, metadata})
      end,
      nil
    )

    try do
      result = fun.()

      assert_receive {:verification_event, ^event_name, measurements, metadata}

      {result, %{measurements: measurements, metadata: metadata}}
    after
      :telemetry.detach(handler_id)
    end
  end
end
