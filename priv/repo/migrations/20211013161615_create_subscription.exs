defmodule FormDelegate.Repo.Migrations.CreateSubscription do
  use Ecto.Migration

  def change do
    create table("subscriptions", primary_key: false) do
      add(:id, :binary_id, primary_key: true)

      add(:team_id, references(:teams, type: :uuid), null: false)
      add(:stripe_subscription_status, :string, null: false)
      add(:stripe_subscription_id, :string, null: false)
      add(:ends_at, :naive_datetime)

      timestamps(type: :timestamptz)
    end

    create index("subscriptions", :team_id)
    create index("subscriptions", :stripe_subscription_status)
    create unique_index("subscriptions", :stripe_subscription_id)
  end
end
