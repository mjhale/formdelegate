defmodule FormDelegate.Jobs.BillingCountsTest do
  use FormDelegate.DataCase
  use Oban.Testing, repo: FormDelegate.Repo

  alias FormDelegate.BillingCounts
  alias FormDelegate.BillingCounts.BillingCount
  alias FormDelegate.Factory
  alias FormDelegate.Jobs.BillingCounts, as: BillingCountsJob
  alias FormDelegate.Repo
  alias FormDelegate.Submissions.Attachment

  test "preserves current counters and rolls expired periods forward" do
    {current_user, current_team, _membership} = Factory.insert_user_with_membership()
    {expired_user, expired_team, _membership} = Factory.insert_user_with_membership()
    current_time = ~U[2026-01-15 00:00:00.000000Z]

    current_period =
      Repo.insert!(%BillingCount{
        team_id: current_team.id,
        started_at: ~U[2026-01-01 00:00:00.000000Z],
        ended_at: ~U[2026-01-31 00:00:00.000000Z],
        form_count: 7,
        submission_count: 8,
        storage_count: 9
      })

    Factory.insert(:form, user: current_user, team: current_team)

    Repo.insert!(%BillingCount{
      team_id: expired_team.id,
      started_at: ~U[2025-12-01 00:00:00.000000Z],
      ended_at: ~U[2025-12-31 00:00:00.000000Z],
      form_count: 7,
      submission_count: 8,
      storage_count: 9
    })

    expired_form = Factory.insert(:form, user: expired_user, team: expired_team)
    expired_submission = Factory.insert(:submission, form: expired_form)

    Repo.insert!(%Attachment{
      content_type: "text/plain",
      field_name: "upload",
      file_name: "notes.txt",
      file_size: 1234,
      submission_id: expired_submission.id
    })

    assert :ok =
             BillingCountsJob.perform(%Oban.Job{
               args: %{"current_time" => DateTime.to_iso8601(current_time)},
               attempt: 2
             })

    unchanged_period = BillingCounts.get_latest_billing_count_of_team(current_team.id)
    assert unchanged_period.id == current_period.id
    assert unchanged_period.form_count == 7
    assert unchanged_period.submission_count == 8
    assert unchanged_period.storage_count == 9

    rolled_period = BillingCounts.get_latest_billing_count_of_team(expired_team.id)
    refute rolled_period.started_at == ~U[2025-12-01 00:00:00.000000Z]
    assert rolled_period.started_at == ~U[2025-12-31 00:00:00.000000Z]
    assert rolled_period.ended_at == ~U[2026-01-30 00:00:00.000000Z]
    assert rolled_period.form_count == 1
    assert rolled_period.submission_count == 0
    assert rolled_period.storage_count == 1234
  end

  test "schedules one successor on the first attempt and none on retries" do
    current_time = ~U[2026-01-15 00:00:00.000000Z]
    next_time = DateTime.add(current_time, 5, :minute)
    args = %{"current_time" => DateTime.to_iso8601(current_time)}

    Oban.Testing.with_testing_mode(:manual, fn ->
      assert :ok = perform_job(BillingCountsJob, args, attempt: 1)

      assert_enqueued(
        worker: BillingCountsJob,
        args: %{"current_time" => DateTime.to_iso8601(next_time)}
      )

      assert length(all_enqueued(worker: BillingCountsJob)) == 1

      assert :ok = perform_job(BillingCountsJob, args, attempt: 2)
      assert length(all_enqueued(worker: BillingCountsJob)) == 1
    end)
  end
end
