defmodule FormDelegate.AccountController do
  use FormDelegate.Web, :controller

  alias FormDelegate.Account

  # plug Guardian.Plug.EnsureAuthenticated, handler: FormDelegate.AuthorizationController

  def index(conn, _params) do
    accounts = Repo.all(Account)
    render(conn, "index.json", accounts: accounts)
  end

  def create(conn, %{"account" => account_params}) do
    changeset = Account.registration_changeset(%Account{}, account_params)

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
    account = Repo.get!(Account, id)
    render(conn, "show.json", account: account)
  end

  def update(conn, %{"id" => id, "account" => account_params}) do
    account = Repo.get!(Account, id)
    changeset = Account.changeset(account, account_params)

    case Repo.update(changeset) do
      {:ok, account} ->
        render(conn, "show.json", account: account)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(FormDelegate.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    account = Repo.get!(Account, id)

    Repo.delete!(account)

    send_resp(conn, :no_content, "")
  end

  def authenticate(%{"username" => username, "password" => password}) do
    account = Repo.get_by(Account, username: username)

    case check_password(account, password) do
      true -> {:ok, account}
      _ -> :error
    end
  end

  defp check_password(account, password) do
    case account do
      nil -> false
      _ -> Comeonin.Pbkdf2.checkpw(password, account.password_hash)
    end
  end
end
