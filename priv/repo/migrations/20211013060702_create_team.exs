defmodule FormDelegate.Repo.Migrations.CreateTeam do
  use Ecto.Migration

  def change do
    create table("teams", primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:name, :string)

      timestamps(type: :timestamptz)
    end

    alter table("users") do
      add(:stripe_customer_id, :string)
      add(:is_billing_account, :boolean, default: true, null: false)
      add(:team_id, references(:teams, type: :uuid, on_delete: :nilify_all))
    end

    create index("users", :team_id)
    create unique_index("users", :stripe_customer_id)
  end
end
