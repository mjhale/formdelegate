defmodule FormDelegate.Services.Zapier do
  require Logger

  def send_submission(_user, _submission) do
    Logger.info("Zapier submission")
  end
end
