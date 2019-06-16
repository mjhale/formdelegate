defmodule FormDelegate.Factory do
  use ExMachina.Ecto, repo: FormDelegate.Repo

  @spec user_factory :: FormDelegate.Accounts.User.t()
  def user_factory do
    %FormDelegate.Accounts.User{
      email: sequence(:email, &"User #{&1}"),
      password: "securepass",
      password_hash: Pbkdf2.hash_pwd_salt("securepass")
    }
  end

  def message_factory do
    %FormDelegate.Messages.Message{
      user: build(:user),
      sender: sequence(:sender, &"User #{&1}"),
      content: sequence(:content, &"Content message #{&1}")
    }
  end

  def integration_factory do
    %FormDelegate.Integrations.Integration{
      type: sequence(:type, &"Type #{&1}")
    }
  end

  def make_admin(user) do
    %{user | is_admin: true}
  end
end
