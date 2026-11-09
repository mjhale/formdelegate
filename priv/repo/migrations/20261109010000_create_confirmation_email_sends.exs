defmodule FormDelegate.Repo.Migrations.CreateConfirmationEmailSends do
  use Ecto.Migration

  def change do
    create table(:confirmation_email_sends) do
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :inserted_at, :utc_datetime_usec, null: false, default: fragment("now()")
    end

    create index(:confirmation_email_sends, [:user_id, :inserted_at])
    create index(:confirmation_email_sends, [:inserted_at])
  end
end
