defmodule FormDelegate.Repo.Migrations.AddSubmissionDeliveryResults do
  use Ecto.Migration

  def change do
    alter table(:submission_deliveries) do
      add :failed_at, :utc_datetime_usec
      add :provider_message_id, :string
    end
  end
end
