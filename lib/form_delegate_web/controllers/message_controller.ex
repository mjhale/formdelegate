defmodule FormDelegateWeb.MessageController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Message

  def index(conn, params) do
    current_user = FormDelegateWeb.Guardian.Plug.current_resource(conn)

    query = from m in Message,
      where: m.user_id == ^current_user.id,
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

  def create(conn, %{"message" => message_params}) do
    current_user = FormDelegateWeb.Guardian.Plug.current_resource(conn)

    changeset = build_assoc(current_user, :messages)
    |> Message.create_changeset(message_params)

    case Repo.insert(changeset) do
      {:ok, message} ->
        conn
        |> put_status(:created)
        |> put_resp_header("location", message_path(conn, :show, message))
        |> render("show.json", message: message)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(FormDelegate.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    message = Message |> Repo.get!(id) |> Repo.preload([:user])
    render(conn, "show.json", message: message)
  end

  def delete(conn, %{"id" => id}) do
    message = Message |> Repo.get!(id) |> Repo.preload([:user])

    message
    |> Message.delete_changeset
    |> Repo.delete!

    send_resp(conn, :no_content, "")
  end
end