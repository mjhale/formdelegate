defmodule FormDelegateWeb.FallbackController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.

  See `Phoenix.Controller.action_fallback/1` for more details.
  """
  use FormDelegateWeb, :controller

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"401")
  end

  def call(conn, {:error, :unauthorized, %{type: type}}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"401", %{type: type})
  end

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(FormDelegateWeb.ChangesetView)
    |> render(:error, changeset: changeset)
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"404")
  end

  def call(conn, {:error, :forbidden}) do
    conn
    |> put_status(:forbidden)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"403")
  end

  def call(conn, {:error, :submission_source_not_allowed}) do
    conn
    |> put_status(:forbidden)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"403", %{type: "SUBMISSION_SOURCE_NOT_ALLOWED"})
  end

  def call(conn, {:error, :bad_request}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400")
  end

  def call(conn, {:error, :bad_request, %{type: type}}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{type: type})
  end

  def call(conn, {:error, :invalid_or_expired_token}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{type: "INVALID_OR_EXPIRED_TOKEN"})
  end

  def call(conn, {:error, :invalid_or_expired_captcha}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{type: "INVALID_OR_EXPIRED_CAPTCHA"})
  end

  def call(conn, {:error, :last_team_member}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{type: "LAST_TEAM_MEMBER"})
  end

  def call(conn, {:error, :last_team_admin}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{type: "LAST_TEAM_ADMIN"})
  end

  def call(conn, {:error, :duplicate_invitation}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{type: "DUPLICATE_INVITATION"})
  end

  def call(conn, {:error, :already_team_member}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{type: "ALREADY_TEAM_MEMBER"})
  end

  def call(conn, {:error, :plan_grace_limit_exceeded}) do
    conn
    |> put_status(:service_unavailable)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"503", %{type: "PLAN_GRACE_LIMIT_EXCEEDED"})
  end

  def call(conn, {:error, :plan_limit_exceeded}) do
    conn
    |> put_status(:service_unavailable)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"503", %{type: "PLAN_LIMIT_EXCEEDED"})
  end
end
