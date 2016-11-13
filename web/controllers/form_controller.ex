defmodule FormDelegate.FormController do
  use FormDelegate.Web, :controller

  plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.SessionController

  def index(conn, _params) do
    current_account = Guardian.Plug.current_resource(conn)
    forms = Repo.all(account_forms(current_account))

    render(conn, "index.json", forms: forms)
  end

  defp account_forms(account) do
    assoc(account, :forms)
  end
end
