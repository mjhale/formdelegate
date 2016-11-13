defmodule FormDelegate.Repo.Migrations.CreateMessage do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :content, :string, null: false
      add :sender, :string, null: false
      add :unknown_fields, :map

      add :account_id, references(:accounts, on_delete: :delete_all)

      timestamps()
    end

    create index(:messages, [:account_id])
  end
end
