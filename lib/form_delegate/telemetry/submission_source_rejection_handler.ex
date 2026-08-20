defmodule FormDelegate.Telemetry.SubmissionSourceRejectionHandler do
  @moduledoc """
  Logger-backed telemetry handler for rejected form submission sources.
  """

  require Logger

  @handler_id "form-delegate-submission-source-rejection-logger"
  @event_name [:form_delegate, :submission, :source_rejected]

  def attach do
    case :telemetry.attach(@handler_id, @event_name, &__MODULE__.handle_event/4, nil) do
      :ok -> :ok
      {:error, :already_exists} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  def handle_event(@event_name, _measurements, metadata, _config) do
    Logger.warning("submission source rejected",
      form_id: metadata.form_id,
      team_id: metadata.team_id,
      request_id: metadata.request_id,
      submission_source_reason: metadata.reason,
      submission_source_host: metadata.observed_host
    )
  end
end
