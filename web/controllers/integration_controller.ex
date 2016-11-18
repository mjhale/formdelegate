defmodule FormDelegate.IntegrationController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Integration

  plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.SessionController

  def index(conn, _params) do
    integrations = Repo.all(Integration)

    render(conn, "index.json", integrations: integrations)
  end
end
