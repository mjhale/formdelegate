defmodule FormDelegate.Factory do
  use ExMachina.Ecto, repo: FormDelegate.Repo

  def user_factory do
    %FormDelegate.Accounts.User{
      email: sequence(:email, &"User #{&1}"),
      password: "securepass",
      password_hash: Comeonin.Pbkdf2.hashpwsalt("securepass"),
    }
  end

  def message_factory do
    %FormDelegate.Message{
      user: build(:user),
      sender: sequence(:sender, &"User #{&1}"),
      content: sequence(:content, &"Content message #{&1}"),
    }
  end

  def make_admin(user) do
    %{user | is_admin: true}
  end
end
