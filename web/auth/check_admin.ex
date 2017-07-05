defmodule FormDelegate.CheckAdmin do
  import Phoenix.Controller
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    current_account = Guardian.Plug.current_resource(conn)

    if current_account.is_admin do
      conn
    else
      conn
      |> put_status(:not_found)
      |> render(FormDelegate.ErrorView,  "404.json")
      |> halt
    end
  end
end
