defmodule FormDelegate.Services.Ifttt do
  require Logger

  def send_request(_account, _integration, _message) do
    Logger.info "Ifttt request"
  end
end