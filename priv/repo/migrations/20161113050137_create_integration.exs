defmodule FormDelegate.Repo.Migrations.CreateIntegration do
  use Ecto.Migration

  def change do
    create table(:integrations) do
      add :type, :string, null: false
      add :enabled, :boolean, default: false, null: false

      timestamps()
    end

    create table(:forms_integrations) do
      add :form_id, references(:forms, type: :uuid)
      add :integration_id, references(:integrations)

      timestamps()
    end

    create index(:forms_integrations, [:form_id])
  end
end
