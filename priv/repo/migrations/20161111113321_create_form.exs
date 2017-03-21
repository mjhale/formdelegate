defmodule FormDelegate.Repo.Migrations.CreateForm do
  use Ecto.Migration

  def change do
    create table(:forms, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :form, :string
      add :callback, :string
      add :host, :string
      add :verified, :boolean, null: false, default: false
      add :message_count, :integer, null: false, default: 0

      add :account_id, references(:accounts, on_delete: :delete_all)

      timestamps()
    end

    create index(:forms, [:account_id])
  end
end
