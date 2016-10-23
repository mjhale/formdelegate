defmodule FormDelegate.TestHelpers do
  alias FormDelegate.Repo

  def insert_account(attrs \\ %{}) do
    changes = Dict.merge(%{
      name: "A. Sherlock",
      username: "asher",
      password: "a password phrase",
    }, attrs)

    %FormDelegate.Account{}
    |> FormDelegate.Account.registration_changeset(changes)
    |> Repo.insert!()
  end
end
