defmodule FormDelegate.AccountController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Account

  plug Guardian.Plug.EnsureAuthenticated, [handler: FormDelegate.SessionController]
    when not action in [:create]

  def create(conn, %{"account" => account_params}) do
    changeset = Account.changeset(%Account{}, account_params)

    case Repo.insert(changeset) do
      {:ok, account} ->
        conn
        |> put_status(:created)
        |> put_resp_header("location", account_path(conn, :show, account))
        |> render("show.json", account: account)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(FormDelegate.ChangesetView, "error.json", changeset: changeset)
    end
  end

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
