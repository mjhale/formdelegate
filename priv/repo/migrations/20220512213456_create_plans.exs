defmodule FormDelegate.Repo.Migrations.CreatePlans do
  use Ecto.Migration

  def change do
    create table(:plans, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string
      add :stripe_product_id, :string

      add :limit_submissions, :integer, default: 100
      add :limit_forms, :integer, default: 0
      add :limit_storage, :bigint, default: 5_000

      timestamps(type: :timestamptz)
    end

    alter table("subscriptions") do
      add(:plan_id, references(:plans, type: :uuid), null: false)
    end

    create index(:plans, :name)
    create unique_index(:plans, :stripe_product_id)

    create index(:subscriptions, :plan_id)
  end
end
