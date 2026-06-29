defmodule FormDelegate.Repo.Migrations.AddAuthTokenVersionToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:auth_token_version, :integer, null: false, default: 0)
    end
  end
end
