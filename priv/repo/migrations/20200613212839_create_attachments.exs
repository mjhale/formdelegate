defmodule FormDelegate.Repo.Migrations.CreateSubmissionAttachments do
  use Ecto.Migration

  def change do
    create table(:attachments, primary_key: false) do
      add(:id, :binary_id, primary_key: true)

      add(:content_type, :text)
      add(:field_name, :text)
      add(:file, :text)
      add(:file_name, :text)
      add(:file_size, :integer)

      add(:submission_id, references(:submissions, type: :uuid, on_delete: :delete_all),
        null: false
      )

      timestamps(type: :timestamptz)
    end

    create(index(:attachments, [:submission_id]))
    create(index(:attachments, [:file_size]))
  end
end
