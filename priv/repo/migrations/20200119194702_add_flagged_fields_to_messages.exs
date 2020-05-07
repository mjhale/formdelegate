defmodule FormDelegate.Repo.Migrations.AddFlaggedFieldsToMessages do
  use Ecto.Migration

  def change do
    create table(:flagged_types) do
      add(:type, :string)
      add(:description, :string)

      timestamps()
    end

    alter table("messages") do
      add(:flagged_at, :naive_datetime)
      add(:flagged_type_id, references(:flagged_types))
    end

    create(unique_index(:flagged_types, [:type]))
    create(index(:messages, [:flagged_type_id]))
  end
end
