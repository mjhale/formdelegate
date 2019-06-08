defmodule FormDelegateWeb.Services.Ifttt do
  require Logger

  def send_request(_user, _message) do
    Logger.info("Ifttt request")
  end
end
