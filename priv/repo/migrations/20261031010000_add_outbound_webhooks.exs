defmodule FormDelegate.Repo.Migrations.AddOutboundWebhooks do
  use Ecto.Migration

  def up do
    execute("ALTER TYPE integration_type ADD VALUE IF NOT EXISTS 'webhook'")

    alter table(:form_integrations) do
      add(:webhook_url, :text)
      add(:webhook_signing_secret, :text)
    end
  end

  def down do
    # Removing the feature also removes its configs and cascading delivery
    # receipts. Do not leave rows older code cannot interpret or re-enable.
    execute("DELETE FROM form_integrations WHERE integration_type = 'webhook'")

    alter table(:form_integrations) do
      remove(:webhook_url)
      remove(:webhook_signing_secret)
    end

    # PostgreSQL enum values cannot be removed without rebuilding the type.
  end
end
