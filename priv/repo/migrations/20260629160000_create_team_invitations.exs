defmodule FormDelegate.Repo.Migrations.CreateTeamInvitations do
  use Ecto.Migration

  def change do
    create table(:team_invitations, primary_key: false) do
      add(:id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()"))
      add(:team_id, references(:teams, type: :uuid, on_delete: :delete_all), null: false)
      add(:email, :string, null: false)
      add(:token_digest, :string, null: false)
      add(:inviter_id, references(:users, on_delete: :nilify_all), null: true)
      add(:status, :string, null: false, default: "pending")
      add(:expires_at, :utc_datetime_usec, null: false)
      add(:accepted_at, :utc_datetime_usec)

      timestamps(type: :timestamptz)
    end

    create(index(:team_invitations, [:team_id]))
    create(index(:team_invitations, [:inviter_id]))
    create(unique_index(:team_invitations, [:token_digest]))

    create(
      unique_index(:team_invitations, [:team_id, :email],
        name: :team_invitations_pending_team_email_index,
        where: "status = 'pending'"
      )
    )
  end
end
