defmodule FormDelegateWeb.UserController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegateWeb.Authorizer
  alias FormDelegateWeb.Guardian
  alias FormDelegateWeb.Mailers

  action_fallback FormDelegateWeb.FallbackController

  def action(conn, _opts) do
    args = [conn, conn.params, conn.assigns[:current_user] || :guest]
    apply(__MODULE__, action_name(conn), args)
  end

  def index(conn, _params, current_user) do
    with :ok <- Authorizer.authorize(:show_users, current_user) do
      users = Accounts.list_users()
      render(conn, :index, users: users)
    end
  end

  def create(conn, %{"user" => user_params, "captcha" => captcha_token}, current_user) do
    with :ok <- Authorizer.authorize(:register_user, current_user),
         {:ok, _captcha_response} <- hcaptcha_api().verify_token(captcha_token),
         {:ok, %User{} = user} <- Accounts.register_user(user_params),
         {:ok, token, _claims} <- Guardian.encode_and_sign(user, %{}, token_type: "access") do
      Mailers.UserConfirmation.send_user_confirmation_email(user)

      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.user_path(conn, :show, user.id))
      |> render(:sign_up, %{token: token, user: user})
    end
  end

  def show(conn, %{"id" => id}, current_user) do
    with %User{} = user <- Accounts.get_user!(id),
         :ok <- Authorizer.authorize(:show_user, current_user, user) do
      render(conn, :show, user: user)
    end
  end

  def update(conn, %{"id" => id, "user" => user_params}, current_user) do
    with %User{} = user <- Accounts.get_user!(id),
         :ok <- Authorizer.authorize(:update_user, current_user, user),
         {:ok, %User{} = user} <- Accounts.update_user(user, user_params) do
      render(conn, :show, user: user)
    end
  end

  def delete(conn, %{"id" => id}, current_user) do
    with %User{} = user <- Accounts.get_user!(id),
         :ok <- Authorizer.authorize(:delete_user, current_user, user),
         {:ok, %User{} = _user} <- Accounts.delete_user(user) do
      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:no_content, "")
    end
  end

  defp hcaptcha_api do
    Application.get_env(:form_delegate, :hcaptcha_api)
  end
end
