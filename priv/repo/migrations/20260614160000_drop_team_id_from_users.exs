defmodule FormDelegate.Repo.Migrations.DropTeamIdFromUsers do
  use Ecto.Migration

  def up do
    execute("DROP INDEX IF EXISTS users_team_id_index")
    execute("ALTER TABLE users DROP COLUMN IF EXISTS team_id")
  end

  def down do
    execute("""
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
    """)

    execute("CREATE INDEX IF NOT EXISTS users_team_id_index ON users(team_id)")

    execute("""
    UPDATE users
    SET team_id = user_memberships.team_id
    FROM (
      SELECT DISTINCT ON (user_id) user_id, team_id
      FROM memberships
      ORDER BY user_id, inserted_at ASC
    ) AS user_memberships
    WHERE users.id = user_memberships.user_id
      AND users.team_id IS NULL;
    """)
  end
end
