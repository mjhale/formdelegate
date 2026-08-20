defmodule FormDelegate.Repo.Migrations.AddSubmissionSourcePolicyToForms do
  use Ecto.Migration

  def change do
    alter table(:forms) do
      add(:submission_source_policy, :string, null: false, default: "unrestricted")
    end

    create(
      constraint(:forms, :forms_submission_source_policy_check,
        check: "submission_source_policy IN ('unrestricted', 'restricted')"
      )
    )
  end
end
