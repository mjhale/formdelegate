defmodule FormDelegate.Services.Ifttt do
  require Logger

  def send_submission(_user, _submission) do
    Logger.debug("Ifttt submission")
  end
end
