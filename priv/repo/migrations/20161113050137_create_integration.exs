defmodule FormDelegate.Repo.Migrations.CreateIntegration do
  use Ecto.Migration

  def change do
    create table(:integrations) do
      add :type, :string, null: false

      timestamps()
    end

    create table(:forms_integrations) do
      add :form_id, references(:forms, type: :uuid)
      add :integration_id, references(:integrations)
      add :enabled, :boolean, default: false, null: false
      add :settings, :map

      timestamps()
    end

    create index(:forms_integrations, [:form_id, :integration_id])
  end
end
