defmodule FormDelegate.Repo.Migrations.MigrateStripeBillingFields do
  use Ecto.Migration

  def up do
    # 1. Add fields to teams and plans
    alter table(:teams) do
      add(:stripe_customer_id, :string)
    end

    alter table(:plans) do
      add(:stripe_price_id, :string)
    end

    create(unique_index(:teams, [:stripe_customer_id]))
    create(unique_index(:plans, [:stripe_price_id]))

    # 2. Create memberships join table
    create table(:memberships, primary_key: false) do
      add(:id, :binary_id, primary_key: true, default: fragment("gen_random_uuid()"))
      add(:user_id, references(:users, on_delete: :delete_all), null: false)
      add(:team_id, references(:teams, type: :uuid, on_delete: :delete_all), null: false)
      add(:is_billing_account, :boolean, default: false, null: false)

      timestamps(type: :timestamptz)
    end

    create(unique_index(:memberships, [:user_id, :team_id]))

    # 3. Migrate existing stripe_customer_id from users to teams
    execute("""
    UPDATE teams
    SET stripe_customer_id = users.stripe_customer_id
    FROM users
    WHERE users.team_id = teams.id
      AND users.is_billing_account = true
      AND users.stripe_customer_id IS NOT NULL;
    """)

    # 4. Migrate existing users into memberships
    execute("""
    INSERT INTO memberships (id, user_id, team_id, is_billing_account, inserted_at, updated_at)
    SELECT gen_random_uuid(), id, team_id, is_billing_account, NOW(), NOW()
    FROM users
    WHERE team_id IS NOT NULL;
    """)

    # 5. Drop billing and legacy team ownership columns from users table
    drop_if_exists(index(:users, [:team_id]))

    alter table(:users) do
      remove(:stripe_customer_id)
      remove(:is_billing_account)
      remove(:team_id)
    end
  end

  def down do
    alter table(:users) do
      add(:stripe_customer_id, :string)
      add(:is_billing_account, :boolean, default: true, null: false)
    end

    execute("""
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
    """)

    execute("CREATE INDEX IF NOT EXISTS users_team_id_index ON users(team_id)")
    create(unique_index(:users, [:stripe_customer_id]))

    # Restore the legacy user team pointer from the first membership for rollback.
    execute("""
    UPDATE users
    SET team_id = user_memberships.team_id
    FROM (
      SELECT DISTINCT ON (user_id) user_id, team_id
      FROM memberships
      ORDER BY user_id, inserted_at ASC
    ) AS user_memberships
    WHERE users.id = user_memberships.user_id;
    """)

    # Restore stripe_customer_id to users from teams
    execute("""
    UPDATE users
    SET stripe_customer_id = teams.stripe_customer_id
    FROM teams
    WHERE users.team_id = teams.id AND teams.stripe_customer_id IS NOT NULL;
    """)

    # Restore is_billing_account to users from memberships
    execute("""
    UPDATE users
    SET is_billing_account = memberships.is_billing_account
    FROM memberships
    WHERE memberships.user_id = users.id;
    """)

    drop(table(:memberships))

    alter table(:plans) do
      remove(:stripe_price_id)
    end

    alter table(:teams) do
      remove(:stripe_customer_id)
    end
  end
end
