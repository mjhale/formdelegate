defmodule FormDelegate.TestHelpers do
  {:ok, _} = Application.ensure_all_started(:ex_machina)

  alias FormDelegate.Repo

  def insert_account(attrs \\ %{}) do
    changes = Dict.merge(%{
      name: "A. Sherlock",
      username: "asher",
      password: "a password phrase",
    }, attrs)

    %FormDelegate.Account{}
    |> FormDelegate.Account.changeset(changes)
    |> Repo.insert!()
  end

  def insert_message(account, attrs \\ %{}) do
    account
    |> Ecto.build_assoc(:messages, attrs)
    |> Repo.insert!()
  end
end
