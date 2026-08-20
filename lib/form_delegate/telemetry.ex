defmodule FormDelegate.Telemetry do
  @moduledoc """
  Central attachment point for telemetry handlers used by the application.
  """

  alias FormDelegate.Telemetry.EmailIntegrationVerificationHandler
  alias FormDelegate.Telemetry.SubmissionSourceRejectionHandler

  def attach_handlers do
    with :ok <- EmailIntegrationVerificationHandler.attach(),
         :ok <- SubmissionSourceRejectionHandler.attach() do
      :ok
    end
  end
end
