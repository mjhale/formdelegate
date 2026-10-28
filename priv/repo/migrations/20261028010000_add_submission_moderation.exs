defmodule FormDelegate.Repo.Migrations.AddSubmissionModeration do
  use Ecto.Migration

  def up do
    alter table(:forms) do
      add :spam_filter_mode, :string, null: false, default: "balanced"
    end

    create constraint(:forms, :forms_spam_filter_mode_check,
      check: "spam_filter_mode IN ('balanced', 'review_all', 'off')")

    alter table(:submissions) do
      # Existing submissions retain their original delivery and flag semantics.
      add :moderation_status, :string, null: false, default: "unclassified"
      add :spam_assessment, :map
      add :content_fingerprint, :string
      add :reviewed_at, :utc_datetime_usec
      add :reviewed_by_id, references(:users, on_delete: :nilify_all)
      add :integrations_enqueued_at, :utc_datetime_usec
    end

    # Do not replay pre-migration deliveries when a legacy record is reclassified.
    execute "UPDATE submissions SET integrations_enqueued_at = inserted_at AT TIME ZONE 'UTC'"

    alter table(:submissions) do
      modify :moderation_status, :string, default: "pending"
    end

    create constraint(:submissions, :submissions_moderation_status_check,
      check: "moderation_status IN ('unclassified', 'pending', 'accepted', 'review', 'spam', 'approved')")
    create index(:submissions, [:form_id, :content_fingerprint, :inserted_at])
    create index(:submissions, [:form_id, :sender_ip, :inserted_at])
  end

  def down do
    drop index(:submissions, [:form_id, :sender_ip, :inserted_at])
    drop index(:submissions, [:form_id, :content_fingerprint, :inserted_at])
    drop constraint(:submissions, :submissions_moderation_status_check)
    alter table(:submissions) do
      remove :integrations_enqueued_at
      remove :reviewed_by_id
      remove :reviewed_at
      remove :content_fingerprint
      remove :spam_assessment
      remove :moderation_status
    end
    drop constraint(:forms, :forms_spam_filter_mode_check)
    alter table(:forms) do
      remove :spam_filter_mode
    end
  end
end
