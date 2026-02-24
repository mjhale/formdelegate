defmodule FormDelegate.Telemetry do
  @moduledoc """
  Central attachment point for telemetry handlers used by the application.
  """

  alias FormDelegate.Telemetry.EmailIntegrationVerificationHandler

  def attach_handlers do
    EmailIntegrationVerificationHandler.attach()
  end
end
