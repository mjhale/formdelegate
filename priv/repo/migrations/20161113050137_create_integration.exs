defmodule FormDelegate.Repo.Migrations.CreateIntegration do
  use Ecto.Migration

  def change do
    create table(:integrations) do
      add(:type, :string, null: false)

      timestamps(type: :timestamptz)
    end

    create table(:form_integrations) do
      add(:form_id, references(:forms, type: :uuid, on_delete: :delete_all), null: false)
      add(:integration_id, references(:integrations, on_delete: :delete_all), null: false)
      add(:enabled, :boolean, default: false, null: false)
      add(:settings, :map)

      timestamps(type: :timestamptz)
    end

    create(index(:form_integrations, [:form_id, :integration_id]))
  end
end
