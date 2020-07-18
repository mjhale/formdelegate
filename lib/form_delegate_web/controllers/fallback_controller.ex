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

  def call(conn, {:error, :unauthorized, %{message: message}}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"401", %{message: message})
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

  def call(conn, {:error, :bad_request}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400")
  end

  def call(conn, {:error, :bad_request, %{message: message}}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{message: message})
  end

  def call(conn, {:error, :invalid_or_expired_token}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{message: "INVALID_OR_EXPIRED_TOKEN"})
  end

  def call(conn, {:error, :invalid_or_expired_captcha}) do
    conn
    |> put_status(:bad_request)
    |> put_view(FormDelegateWeb.ErrorView)
    |> render(:"400", %{message: "INVALID_OR_EXPIRED_CAPTCHA"})
  end
end
