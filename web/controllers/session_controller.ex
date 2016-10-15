defmodule FormDelegate.SessionController do
  use FormDelegate.Web, :controller

  plug :scrub_params, "session" when action in [:create]

  def create(conn, %{"session" => session_params}) do
    case FormDelegate.Session.authenticate(session_params) do
      {:ok, account} ->
        new_conn = Guardian.Plug.api_sign_in(conn, account)
        jwt = Guardian.Plug.current_token(new_conn)
        {:ok, claims} = Guardian.Plug.claims(new_conn)
        exp = Map.get(claims, "exp")

        new_conn
        |> put_resp_header("authorization", "Bearer #{jwt}")
        |> put_resp_header("x-expires", "#{exp}")
        |> render("show.json", %{account: account, jwt: jwt, exp: exp})
      :error ->
        conn
        |> put_status(:unprocessable_entity)
        |> render("error.json")
    end
  end

  def delete(conn, _params) do
    Guardian.Plug.sign_out(conn)
    |> redirect(to: "/")
  end

  def unauthenticated(conn, _params) do
    conn
    |> put_status(:forbidden)
    |> render(FormDelegate.SessionView, "forbidden.json", error: "Not Authenticated")
  end
end
