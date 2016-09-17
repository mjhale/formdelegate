defmodule FormDelegate.AuthorizationController do
	use FormDelegate.Web, :controller
	use Guardian.Phoenix.Controller

	def login(conn, params) do
   conn
   # |> Guardian.Plug.sign_in(conn, account)
   |> redirect(to: "/")
	end

	def unauthenticated(conn, _params) do
		text conn, "Unauthorized"
	end

	def authenticated(conn, _params) do
		text conn, "Authorized"
	end

	defp check_password(account, password) do
		case account do
			nil -> false
			_ -> Comeonin.Pbkdf2.checkpw(password, account.password_hash)
		end
	end
end
