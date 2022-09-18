defmodule FormDelegate.Repo.Migrations.CreatePlans do
  use Ecto.Migration

  def change do
    create table(:plans, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string
      add :stripe_product_id, :string

      add :limit_submissions, :integer, default: 100
      add :limit_forms, :integer, default: 0
      add :limit_storage, :integer, default: 1_000

      timestamps(type: :timestamptz)
    end

    create index(:plans, :name)
    create unique_index(:plans, :stripe_product_id)
  end
end
