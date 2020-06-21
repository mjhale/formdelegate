defmodule FormDelegate.Repo.Migrations.CreateSubmission do
  use Ecto.Migration

  def change do
    create table(:submissions, primary_key: false) do
      add(:id, :binary_id, primary_key: true)

      add(:sender, :string, default: "Anonymous")
      add(:body, :text)

      add(:sender_ip, :string)
      add(:sender_user_agent, :string)
      add(:sender_referrer, :string)

      add(:fields, :map)

      add(:form_id, references(:forms, type: :uuid, on_delete: :delete_all), null: false)

      timestamps(type: :timestamptz)
    end

    create(index(:submissions, [:form_id]))
  end
end
