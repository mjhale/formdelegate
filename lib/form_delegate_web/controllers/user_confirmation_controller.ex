defmodule FormDelegateWeb.UserConfirmationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Accounts, Accounts.User}
  alias FormDelegate.Accounts.{ConfirmationRateLimit, ConfirmationRequests}

  action_fallback FormDelegateWeb.FallbackController

  def create(conn, _params) do
    case ConfirmationRequests.request(conn.assigns.current_user) do
      {:ok, status} when status in [:sent, :already_queued] ->
        conn
        |> put_status(:accepted)
        |> json(%{data: %{status: status, retry_after: ConfirmationRateLimit.cooldown_seconds()}})

      {:ok, :already_verified} ->
        json(conn, %{data: %{status: "already_verified"}})

      {:ok, {:rate_limited, seconds}} ->
        conn
        |> put_status(:too_many_requests)
        |> put_resp_header("retry-after", Integer.to_string(seconds))
        |> json(%{error: %{code: 429, type: "RATE_LIMITED", retry_after: seconds}})

      {:error, _reason} ->
        conn
        |> put_status(:service_unavailable)
        |> json(%{error: %{code: 503, type: "CONFIRMATION_UNAVAILABLE"}})
    end
  end

  def confirm(conn, %{"token" => token}) do
    with %User{} = user <- Accounts.get_user_by_confirmation_token!(token),
         {:ok, %User{} = user} <- Accounts.confirm_user(user) do
      render(conn, :show, user: user)
    end
  end
end
