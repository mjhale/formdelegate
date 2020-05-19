defmodule FormDelegate.Repo.Migrations.CreateSubmission do
  use Ecto.Migration

  def change do
    create table(:submissions) do
      add(:content, :text)

      add(:sender, :string, default: "Anonymous")
      add(:sender_ip, :string)
      add(:sender_user_agent, :string)
      add(:sender_referrer, :string)

      add(:unknown_fields, :map)

      add(:user_id, references(:users, on_delete: :delete_all))
      add(:form_id, references(:forms, type: :uuid, on_delete: :delete_all))

      timestamps()
    end

    create(index(:submissions, [:user_id, :form_id]))
  end
end
