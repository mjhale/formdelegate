defmodule FormDelegate.Session do
  alias FormDelegate.{Repo, Account}

  def authenticate(%{"email" => email, "password" => password}) do
    account = Repo.get_by(Account, email: email)

    case check_password(account, password) do
      true -> {:ok, account}
      _ -> :error
    end
  end

  defp check_password(account, password) do
    case account do
      nil -> false
      _ -> Comeonin.Pbkdf2.checkpw(password, account.password_hash)
    end
  end
end
