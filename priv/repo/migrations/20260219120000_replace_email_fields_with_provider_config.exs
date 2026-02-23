defmodule FormDelegate.Repo.Migrations.ReplaceEmailFieldsWithProviderConfig do
  use Ecto.Migration

  def change do
    alter table(:form_integrations) do
      remove(:email_api_key)
      remove(:email_from_address)

      add(:email_provider, :string)
      add(:email_provider_config, :map)
      add(:email_provider_secrets, :map)
      add(:email_provider_status, :string, null: false, default: "unconfigured")
      add(:email_provider_last_verified_at, :utc_datetime_usec)
    end
  end
end
