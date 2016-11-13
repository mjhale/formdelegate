defmodule FormDelegate.Repo.Migrations.CreateAccount do
  use Ecto.Migration

  def change do
    create table(:accounts) do
      add :name, :string
      add :password_hash, :string
      add :username, :string
      add :forms_count, :integer, null: false, default: 0
      add :messages_count, :integer, null: false, default: 0
      add :verified, :boolean, null: false, default: false
      add :admin, :boolean, null: false, default: false

      timestamps()
    end

    create unique_index(:accounts, [:username])
  end
end
