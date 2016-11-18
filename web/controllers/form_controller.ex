defmodule FormDelegate.FormController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Form

  plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.SessionController

  def index(conn, _params) do
    current_account = Guardian.Plug.current_resource(conn)

    query = from f in Form,
      where: f.account_id == ^current_account.id,
      preload: [{:form_integrations, :integration}, :integrations]

    forms = Repo.all(query)

    render(conn, "index.json", forms: forms)
  end
end
