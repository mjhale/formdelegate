defmodule FormDelegate.MessageController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Message

  plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.SessionController

  def index(conn, _params) do
    current_account = Guardian.Plug.current_resource(conn)
    messages = Repo.all(account_messages(current_account))

    render(conn, "index.json", messages: messages)
  end

  def create(conn, %{"message" => message_params}) do
    current_account = Guardian.Plug.current_resource(conn)

    changeset = current_account
    |> build_assoc(:messages)
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
    message = Message |> Repo.get!(id) |> Repo.preload([:account])
    render(conn, "show.json", message: message)
  end

  def delete(conn, %{"id" => id}) do
    message = Message |> Repo.get!(id) |> Repo.preload([:account])

    message
    |> Message.delete_changeset
    |> Repo.delete!

    send_resp(conn, :no_content, "")
  end

  defp account_messages(account) do
    assoc(account, :messages)
  end
end
