defmodule FormDelegateWeb.IntegrationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Integration

  def index(conn, _params) do
    integrations = Repo.all(Integration)

    render(conn, "index.json", integrations: integrations)
  end
end
