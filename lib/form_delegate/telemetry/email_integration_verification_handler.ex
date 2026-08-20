defmodule FormDelegate.Telemetry.EmailIntegrationVerificationHandler do
  @moduledoc """
  Logger-backed telemetry handler for email integration verification events.
  """

  require Logger

  @handler_id "form-delegate-email-integration-verification-logger"
  @event_name [:form_delegate, :email_integration, :verification]

  def attach do
    case :telemetry.attach(@handler_id, @event_name, &__MODULE__.handle_event/4, nil) do
      :ok -> :ok
      {:error, :already_exists} -> :ok
    end
  end

  def handle_event(@event_name, _measurements, metadata, _config) do
    # @TODO: Add additional metrics and external capturing
    case metadata.status do
      :verified ->
        Logger.info(
          "email integration verification succeeded provider=#{metadata.provider} integration_id=#{metadata.integration_id}"
        )

      :failed ->
        Logger.warning(
          "email integration verification failed provider=#{metadata.provider} integration_id=#{metadata.integration_id} failure_code=#{metadata.failure_code}"
        )
    end
  end
end
