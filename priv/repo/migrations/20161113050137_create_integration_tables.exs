defmodule FormDelegate.Repo.Migrations.CreateIntegrationTables do
  use Ecto.Migration

  def change do
    create table(:integrations) do
      add(:name, :string, null: false)
      add(:type_code, :string, null: false)

      timestamps(type: :timestamptz)
    end

    # Migration for integration_type enum
    execute(&execute_enum_up/0, &execute_enum_down/0)

    create table(:form_integrations, primary_key: false) do
      add(:enabled, :boolean, default: false, null: false)
      add(:id, :binary_id, primary_key: true)

      add(:email_api_key, :string)
      add(:email_from_address, :string)

      add(:form_id, references(:forms, type: :uuid, on_delete: :delete_all), null: false)
      add(:integration_type, :integration_type)

      timestamps(type: :timestamptz)
    end

    create table(:email_integration_recipients) do
      add(:name, :string, default: "")
      add(:email, :string, null: false)
      add(:type, :string, default: "to", null: false)

      add(
        :form_integration_id,
        references(:form_integrations, type: :uuid, on_delete: :delete_all),
        null: false
      )
    end

    create(index(:form_integrations, [:form_id]))
    create(index(:form_integrations, [:form_id, :integration_type]))

    create(index(:email_integration_recipients, [:form_integration_id, :type]))
  end

  defp execute_enum_up, do: repo().query!("CREATE TYPE integration_type AS ENUM ('email', 'zapier', 'ifttt')", [], [log: :info])
  defp execute_enum_down, do: repo().query!("DROP TYPE integration_type", [], [log: :info])
end
