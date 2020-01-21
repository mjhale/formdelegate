defmodule FormDelegate.Repo.Migrations.AddSpamStatusFieldToMessages do
  use Ecto.Migration

  def change do
    alter table("messages") do
      add(:spam_status, :string)
    end
  end
end
