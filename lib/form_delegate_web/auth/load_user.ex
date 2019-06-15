defmodule FormDelegateWeb.LoadUser do
  import Plug.Conn

  def init(opts) do
    opts
  end

  def call(conn, _opts) do
    cond do
      # return connection as is if :current_user exists
      conn.assigns[:current_user] ->
        conn

      # current_resource/1 assigns nil values to unloadable resources
      user = FormDelegateWeb.Guardian.Plug.current_resource(conn) ->
        assign(conn, :current_user, user)
    end
  end
end
