defmodule FormDelegate.Repo.Migrations.CreateMessage do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :content, :string, null: false
      add :sender_name, :string, null: false

      timestamps()
    end

  end
end
