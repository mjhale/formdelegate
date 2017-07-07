defmodule FormDelegate.AccountController do
  use FormDelegate.Web, :controller

  plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.SessionController

  def show(conn, %{"id" => id}) do
    current_account = Guardian.Plug.current_resource(conn)

    if current_account.id === elem(Integer.parse(id), 0) do
      render(conn, "show.json", account: current_account)
    else
      conn
      |> put_status(:unprocessable_entity)
      |> render(FormDelegate.ErrorView, "error.json")
    end
  end
end
