defmodule FormDelegate.Repo.Migrations.ReconcileFormSubmissionCounts do
  use Ecto.Migration

  def up do
    # Keep the recount and live inserts from overwriting each other's counts.
    # Ecto runs this migration in a transaction; the locks end at commit.
    execute("LOCK TABLE forms, submissions IN SHARE ROW EXCLUSIVE MODE")

    execute("""
    UPDATE forms
    SET submission_count = (
      SELECT COUNT(*) FROM submissions WHERE submissions.form_id = forms.id
    )
    """)
  end

  # Corrected derived counts have no meaningful inverse.
  def down, do: :ok
end
