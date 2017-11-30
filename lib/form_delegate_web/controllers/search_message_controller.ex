defmodule FormDelegateWeb.SearchMessageController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Message

  def index(conn, params) do
    current_user = FormDelegateWeb.Guardian.Plug.current_resource(conn)

    query = from m in Message,
      where: m.user_id == ^current_user.id,
      where: ilike(m.content, ^"%#{params["query"]}%") or
             ilike(m.sender, ^"%#{params["query"]}%")  or
             fragment("?->>? ilike ?", m.unknown_fields, "user_mail",  ^"%#{params["query"]}%"),
      left_join: form in assoc(m, :form),
      left_join: form_integrations in assoc(form, :form_integrations),
      left_join: integration in assoc(form_integrations, :integration),
      left_join: integrations in assoc(form, :integrations),
      preload: [
        form: {
          form,
          form_integrations: {form_integrations, integration: integration},
          integrations: integrations
        }
      ],
      distinct: true,
      order_by: [desc: m.id]
    page = query |> Repo.paginate(params)

    conn
    |> Scrivener.Headers.paginate(page)
    |> render("index.json", messages: page.entries)
  end
end
