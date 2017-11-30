defmodule FormDelegateWeb.Session do
  alias FormDelegate.Repo
  alias FormDelegate.Accounts.User

  def authenticate(%{"email" => email, "password" => password}) do
    user = Repo.get_by(User, email: email)

    case check_password(user, password) do
      true -> {:ok, user}
      _ -> :error
    end
  end

  defp check_password(user, password) do
    case user do
      nil -> false
      _ -> Comeonin.Pbkdf2.checkpw(password, user.password_hash)
    end
  end
end
