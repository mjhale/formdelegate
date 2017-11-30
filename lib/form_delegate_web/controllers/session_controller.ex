defmodule FormDelegateWeb.SessionController do
  use FormDelegateWeb, :controller

  plug :scrub_params, "session" when action in [:create]

  def create(conn, %{"session" => session_params}) do
    case FormDelegateWeb.Session.authenticate(session_params) do
      {:ok, user} ->
        {:ok, token, _claims} = FormDelegateWeb.Guardian.encode_and_sign(user, %{}, token_type: "access")

        conn
        |> render("show.json", %{user: user, jwt: token})
      :error ->
        conn
        |> put_status(:unprocessable_entity)
        |> render("error.json")
    end
  end

  def delete(conn, _params) do
    conn
    |> FormDelegateWeb.Guardian.Plug.sign_out(conn)
    |> put_status(:no_content)
  end

  def unauthenticated(conn, _params) do
    conn
    |> put_status(:forbidden)
    |> render(FormDelegate.SessionView, "forbidden.json", error: "Not Authenticated")
  end
end
