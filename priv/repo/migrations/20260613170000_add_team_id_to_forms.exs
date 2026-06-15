defmodule FormDelegate.Repo.Migrations.AddTeamIdToForms do
  use Ecto.Migration

  def up do
    execute("ALTER TABLE forms ADD COLUMN IF NOT EXISTS team_id uuid")

    execute("""
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'forms_team_id_fkey'
          AND conrelid = 'forms'::regclass
      ) THEN
        ALTER TABLE forms
        ADD CONSTRAINT forms_team_id_fkey
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
      END IF;
    END
    $$;
    """)

    execute("""
    UPDATE forms
    SET team_id = user_memberships.team_id
    FROM (
      SELECT DISTINCT ON (user_id) user_id, team_id
      FROM memberships
      ORDER BY user_id, inserted_at ASC
    ) AS user_memberships
    WHERE forms.user_id = user_memberships.user_id;
    """)

    execute("CREATE INDEX IF NOT EXISTS forms_team_id_index ON forms(team_id)")

    execute("ALTER TABLE forms ALTER COLUMN team_id SET NOT NULL")
  end

  def down do
    execute("DROP INDEX IF EXISTS forms_team_id_index")
    execute("ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_team_id_fkey")
    execute("ALTER TABLE forms DROP COLUMN IF EXISTS team_id")
  end
end
