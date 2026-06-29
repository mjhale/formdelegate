defmodule FormDelegateWeb.UserController do
  use FormDelegateWeb, :controller

  plug FormDelegateWeb.Plugs.LoadCurrentTeam when action in [:show, :update]

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegate.Jobs.WelcomeEmail
  alias FormDelegateWeb.Authorizer
  alias FormDelegateWeb.Guardian

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

  def create(conn, %{"captcha" => captcha_token} = registration_params, current_user) do
    with :ok <- Authorizer.authorize(:register_user, current_user),
         {:ok, _captcha_response} <- hcaptcha_api().verify_token(captcha_token),
         {:ok, %User{} = user} <- Accounts.register_user(registration_params),
         {:ok, token, _claims} <-
           Guardian.encode_and_sign(user, %{}, token_type: "access") do
      %{user_id: user.id}
      |> WelcomeEmail.new()
      |> Oban.insert()

      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.user_path(conn, :show, user.id))
      |> render(:sign_up, %{token: token, user: user})
    end
  end

  def show(conn, %{"id" => id}, current_user) do
    with %User{} = user <- Accounts.get_user!(id),
         :ok <- Authorizer.authorize(:show_user, current_user, user) do
      render(conn, :show,
        user: user,
        current_team: conn.assigns.current_team,
        current_membership: conn.assigns.current_membership
      )
    end
  end

  def update(conn, %{"id" => id, "user" => user_params}, current_user) do
    with %User{} = user <- Accounts.get_user!(id),
         :ok <- Authorizer.authorize(:update_user, current_user, user),
         {:ok, %User{} = user} <- Accounts.update_user(user, user_params) do
      user = Accounts.get_user!(user.id)

      render(conn, :show,
        user: user,
        current_team: conn.assigns.current_team,
        current_membership: conn.assigns.current_membership
      )
    end
  end

  def change_password(conn, %{"id" => id, "user" => user_params}, current_user) do
    with %User{} = user <- Accounts.get_user!(id),
         :ok <- Authorizer.authorize(:change_user_password, current_user, user),
         {:ok, %User{} = user} <- Accounts.change_user_password(user, user_params),
         {:ok, token, _claims} <- Guardian.encode_and_sign(user, %{}, token_type: "access") do
      json(conn, %{data: %{token: token}})
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
