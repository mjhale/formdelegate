defmodule FormDelegate.Repo.Migrations.CreateForm do
  use Ecto.Migration

  def change do
    create table(:forms, primary_key: false) do
      add(:id, :binary_id, primary_key: true)

      add(:callback_success_includes_data, :boolean, null: false, default: false)
      add(:callback_success_url, :string)
      add(:hosts, {:array, :string})
      add(:name, :string)
      add(:submission_count, :integer, null: false, default: 0)
      add(:verified, :boolean, null: false, default: false)

      add(:user_id, references(:users, on_delete: :delete_all), null: false)

      timestamps(type: :timestamptz)
    end

    create(index(:forms, [:user_id]))
  end
end
