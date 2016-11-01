defmodule FormDelegate.Factory do
  use ExMachina.Ecto, repo: FormDelegate.Repo

  alias FormDelegate.Account
  alias FormDelegate.GuardianToken

  def factory(:account) do
    %Account{
      username: "admin",
    }
  end

  def factory(:guardian_token) do
    %GuardianToken{
      jti: sequence(:jti, &"jti-#{&1}"),
    }

  def put_account_password(account, password) do
    account
    |> Account.changeset(%{"password" => password})
    |> Ecto.Changeset.apply_changes()
  end

end
