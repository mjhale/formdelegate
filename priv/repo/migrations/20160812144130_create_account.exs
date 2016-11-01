defmodule FormDelegate.Repo.Migrations.CreateAccount do
  use Ecto.Migration

  def change do
    create table(:accounts) do
      add :name, :string
      add :password_hash, :string
      add :username, :string

      timestamps()
    end

    create unique_index(:accounts, [:username])
  end
end
