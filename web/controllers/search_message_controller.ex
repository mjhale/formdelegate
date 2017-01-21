defmodule FormDelegate.SearchMessageController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Message

  plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.SessionController

  def index(conn, params) do
    current_account = Guardian.Plug.current_resource(conn)
  
    # @TODO: Rewrite entire query to search *all* fields
    # - Ensure that it is limited only to current account msgs
    page = assoc(current_account, :messages)
      |> where([m], ilike(m.content, ^"%#{params["query"]}%"))
      # Below clause would include non-current account msgs
      # |> or_where([m], m.sender = ^"%#{params["query"]}%"))
      |> or_where([m], fragment("?->>? ilike ?", m.unknown_fields, "user_mail",  ^"%#{params["query"]}%"))
      |> order_by([m], desc: m.updated_at)
      |> Repo.paginate(params)

    conn
    |> Scrivener.Headers.paginate(page)
    |> render("index.json", messages: page.entries)
  end
end
