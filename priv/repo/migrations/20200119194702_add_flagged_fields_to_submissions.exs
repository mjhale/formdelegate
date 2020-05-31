defmodule FormDelegate.Repo.Migrations.AddFlaggedFieldsToSubmissions do
  use Ecto.Migration

  def change do
    create table(:flagged_types) do
      add(:type, :string)
      add(:description, :string)

      timestamps(type: :timestamptz)
    end

    alter table("submissions") do
      add(:flagged_at, :naive_datetime)
      add(:flagged_type_id, references(:flagged_types))
    end

    create(unique_index(:flagged_types, [:type]))
    create(index(:submissions, [:flagged_type_id]))
  end
end
