defmodule FormDelegate.Repo.Migrations.CreateMessage do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :content, :text
      add :sender, :string, default: "Anonymous"
      add :unknown_fields, :map

      add :account_id, references(:accounts, on_delete: :delete_all)
      add :form_id, references(:forms, type: :uuid, on_delete: :delete_all)

      timestamps()
    end

    create index(:messages, [:account_id, :form_id])
  end
end
