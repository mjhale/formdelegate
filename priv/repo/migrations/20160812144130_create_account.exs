defmodule FormDelegate.Repo.Migrations.CreateAccount do
  use Ecto.Migration

  def change do
    create table(:accounts) do
      add :email, :string, null: false
      add :name, :string
      add :password_hash, :string
      add :form_count, :integer, null: false, default: 0
      add :verified, :boolean, null: false, default: false
      add :is_admin, :boolean, null: false, default: false

      timestamps()
    end

    create unique_index(:accounts, [:email])
  end
end
