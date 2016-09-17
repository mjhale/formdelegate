defmodule FormDelegate.SessionController do
  use FormDelegate.Web, :controller

  plug :scrub_params, "session" when action in [:create]

  def create(conn, %{"session" => session_params}) do
		case FormDelegate.Session.authenticate(session_params) do
			{:ok, account} ->
				{:ok, jwt, _full_claims} = account |> Guardian.encode_and_sign(:token)

				conn
				|> put_status(:created)
				|> Guardian.Plug.sign_in(account)
				|> render("show.json", jwt: jwt, account: account)

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
end
