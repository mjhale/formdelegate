defmodule FormDelegate.Repo.Migrations.AddMessageCountAndVerified do
  use Ecto.Migration

  def change do
    alter table(:accounts) do
      add :messages_count, :integer, null: false, default: 0
      add :verified, :boolean, null: false, default: false
    end
  end
end
