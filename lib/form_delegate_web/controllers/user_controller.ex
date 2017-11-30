defmodule FormDelegateWeb.UserController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Accounts
  alias FormDelegate.Accounts.User

  action_fallback FormDelegateWeb.FallbackController

  def create(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Accounts.create_user(user_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", user_path(conn, :show, user))
      |> render("show.json", user: user)
    end
  end

  def show(conn, %{"id" => _id}) do
    current_user = FormDelegateWeb.Guardian.Plug.current_resource(conn)
    render(conn, "show.json", user: current_user)
  end

  def update(conn, %{"user" => user_params}) do
    current_user = FormDelegateWeb.Guardian.Plug.current_resource(conn)

    with {:ok, %User{} = user} <- Accounts.update_user(current_user, user_params) do
      render(conn, "show.json", user: user)
    end
  end
end
