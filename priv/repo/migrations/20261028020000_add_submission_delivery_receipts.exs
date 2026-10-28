defmodule FormDelegate.Repo.Migrations.AddSubmissionDeliveryReceipts do
  use Ecto.Migration
  def change do
    create table(:submission_deliveries) do
      add :submission_id, references(:submissions, type: :binary_id, on_delete: :delete_all), null: false
      add :form_integration_id, references(:form_integrations, type: :binary_id, on_delete: :delete_all), null: false
      add :attempts, :integer, null: false, default: 0
      add :delivered_at, :utc_datetime_usec
      add :last_error, :string
      timestamps(type: :utc_datetime_usec)
    end
    create unique_index(:submission_deliveries, [:submission_id, :form_integration_id])
  end
end
