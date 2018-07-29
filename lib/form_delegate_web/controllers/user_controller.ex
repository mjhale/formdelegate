defmodule FormDelegateWeb.UserController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(conn, _opts) do
    args = [conn, conn.params, conn.assigns[:current_user] || :guest]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, _params, current_user) do
    with :ok <- Authorizer.authorize(current_user, :show_users) do
      users = Accounts.list_users()
      render(conn, "index.json", users: users)
    end
  end

  def create(conn, %{"user" => user_params}, current_user) do
    with :ok <- Authorizer.authorize(current_user, :create_user),
         {:ok, %User{} = user} <- Accounts.create_user(user_params) do

      conn
      |> put_status(:created)
      |> put_resp_header("location", user_path(conn, :show, user.id))
      |> render("show.json", user: user)
    end
  end

  def show(conn, %{"id" => id}, current_user) do
    with %User{} = user <- Accounts.get_user!(id),
         :ok <- Authorizer.authorize(current_user, :show_user, user) do

      render(conn, "show.json", user: user)
    end
  end

  def update(conn, %{"id" => id, "user" => user_params}, current_user) do
    with %User{} = user <- Accounts.get_user!(id),
         :ok <- Authorizer.authorize(current_user, :update_user, user),
         {:ok, %User{} = user} <- Accounts.update_user(user, user_params) do

      render(conn, "show.json", user: user)
    end
  end

  def delete(conn, %{"id" => id}, current_user) do
    with %User{} = user <- Accounts.get_user!(id),
         :ok <- Authorizer.authorize(current_user, :delete_user, user),
         {:ok, %User{} = _user} <- Accounts.delete_user(user) do

      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:no_content, "")
    end
  end
end
