defmodule FormDelegate.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    execute("CREATE EXTENSION IF NOT EXISTS citext", "DROP EXTENSION IF EXISTS citext")

    create table(:users) do
      add(:email, :citext, null: false)
      add(:unconfirmed_email, :string)
      add(:password_hash, :string, null: false)
      add(:form_count, :integer, null: false, default: 0)
      add(:name, :string)

      add(:confirmation_token, :string)
      add(:confirmation_sent_at, :timestamptz)
      add(:confirmed_at, :timestamptz)

      add(:last_activity_at, :timestamptz)
      add(:last_sign_in_at, :timestamptz)

      add(:reset_password_token, :string)
      add(:reset_password_sent_at, :timestamptz)

      add(:is_admin, :boolean, null: false, default: false)

      timestamps(type: :timestamptz)
    end

    create(index(:users, :last_activity_at))
    create(index(:users, :last_sign_in_at))
    create(unique_index(:users, :confirmation_token))
    create(unique_index(:users, :email))
    create(unique_index(:users, :reset_password_token))
  end
end
