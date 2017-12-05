defmodule FormDelegateWeb.Session do
  alias Comeonin.Pbkdf2
  alias FormDelegate.Accounts
  alias FormDelegate.Accounts.User

  def authenticate(%{email: email, password: password}) do
    with %User{} = user <- Accounts.get_by!(%{email: email}),
         {:ok, %User{} = user} <- Pbkdf2.check_pass(user, password) do

      {:ok, user}
    else
      _ -> {:error, :unauthorized}
    end
  end
end
