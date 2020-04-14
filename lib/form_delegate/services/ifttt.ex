defmodule FormDelegate.Services.Ifttt do
  require Logger

  def send_request(_user, _message) do
    Logger.debug("Ifttt request")
  end
end
