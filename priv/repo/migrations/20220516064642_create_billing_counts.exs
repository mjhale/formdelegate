defmodule FormDelegate.Repo.Migrations.CreateBillingCounts do
  use Ecto.Migration

  def change do
    create table(:billing_counts) do
      add :submission_count, :integer, default: 0
      add :storage_count, :integer, default: 0
      add :form_count, :integer, default: 0
      add :team_id, references(:teams, type: :uuid, on_delete: :delete_all)
      add :started_at, :timestamptz
      add :ended_at, :timestamptz

      timestamps(type: :timestamptz)
    end


    create index(:billing_counts, [:team_id])
    create index(:billing_counts, [:ended_at])
  end
end
