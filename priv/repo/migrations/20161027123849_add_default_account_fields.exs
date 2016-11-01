defmodule FormDelegate.Repo.Migrations.AddDefaultAccountFields do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :messages_count, :integer, null: false, default: 0
      add :verified, :boolean, null: false, default: false
      add :is_admin, :boolean, null: false, default: false
    end
  end
end
