defmodule FormDelegate.Factory do
  use ExMachina.Ecto, repo: FormDelegate.Repo

  def account_factory do
    %FormDelegate.Account{
      username: sequence(:username, &"User #{&1}"),
      password: "securepass",
      password_hash: Comeonin.Pbkdf2.hashpwsalt("securepass"),
    }
  end

  def message_factory do
    %FormDelegate.Message{
      account: build(:account),
      sender: sequence(:sender, &"User #{&1}"),
      content: sequence(:content, &"Content message #{&1}"),
    }
  end

  def make_admin(account) do
    %{account | admin: true}
  end
end
