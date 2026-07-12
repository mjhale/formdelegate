defmodule FormDelegate.BillingCountsTest do
  use FormDelegate.DataCase

  alias FormDelegate.BillingCounts
  alias FormDelegate.BillingCounts.BillingCount
  alias FormDelegate.Factory
  alias FormDelegate.Plans.Plan
  alias FormDelegate.Repo
  alias FormDelegate.Submissions.Attachment

  describe "current_period_for_team!/2" do
    test "creates a current period from source usage" do
      {_user, team, _membership} = Factory.insert_user_with_membership()
      now = ~U[2026-01-01 00:00:00.000000Z]

      period = BillingCounts.current_period_for_team!(team.id, now)

      assert period.team_id == team.id
      assert period.started_at == now
      assert period.ended_at == ~U[2026-01-31 00:00:00.000000Z]
      assert period.form_count == 0
      assert period.submission_count == 0
      assert period.storage_count == 0
    end

    test "rolls expired periods forward and resets period submissions" do
      {user, team, _membership} = Factory.insert_user_with_membership()
      Factory.insert(:form, user: user, team: team)

      Repo.insert!(%BillingCount{
        team_id: team.id,
        started_at: ~U[2026-01-01 00:00:00.000000Z],
        ended_at: ~U[2026-01-31 00:00:00.000000Z],
        form_count: 9,
        submission_count: 9,
        storage_count: 9
      })

      period = BillingCounts.current_period_for_team!(team.id, ~U[2026-02-01 00:00:00.000000Z])

      assert period.started_at == ~U[2026-01-31 00:00:00.000000Z]
      assert period.ended_at == ~U[2026-03-02 00:00:00.000000Z]
      assert period.form_count == 1
      assert period.submission_count == 0
      assert period.storage_count == 0
    end
  end

  describe "usage tracking" do
    test "does not increment usage when the wrapped operation fails" do
      {_user, team, _membership} = Factory.insert_user_with_membership()
      plan = plan(limit_forms: 5)

      assert {:error, :failed} =
               BillingCounts.create_form_with_usage(team.id, plan, fn -> {:error, :failed} end)

      period = BillingCounts.current_period_for_team!(team.id)
      assert period.form_count == 0
    end

    test "blocks writes after the grace threshold" do
      {_user, team, _membership} = Factory.insert_user_with_membership()
      plan = plan(limit_submissions: 1)
      period = BillingCounts.current_period_for_team!(team.id)

      {:ok, _period} =
        BillingCounts.update_billing_count(period, %{
          submission_count: ceil(plan.limit_submissions * BillingCounts.grace_multiplier())
        })

      assert {:error, :plan_grace_limit_exceeded} =
               BillingCounts.create_submission_with_usage(team.id, plan, [], fn ->
                 {:ok, :created}
               end)
    end

    test "allows unlimited form counts when limit_forms is zero" do
      {_user, team, _membership} = Factory.insert_user_with_membership()
      plan = plan(limit_forms: 0)
      period = BillingCounts.current_period_for_team!(team.id)

      {:ok, _period} = BillingCounts.update_billing_count(period, %{form_count: 500})

      assert {:ok, :created} =
               BillingCounts.create_form_with_usage(team.id, plan, fn -> {:ok, :created} end)
    end
  end

  describe "reconcile_current_period/2" do
    test "recomputes current forms, period submissions, and stored bytes" do
      {user, team, _membership} = Factory.insert_user_with_membership()
      form = Factory.insert(:form, user: user, team: team)
      submission = Factory.insert(:submission, form: form)

      Repo.insert!(%Attachment{
        content_type: "text/plain",
        field_name: "upload",
        file_name: "notes.txt",
        file_size: 1234,
        submission_id: submission.id
      })

      Repo.insert!(%BillingCount{
        team_id: team.id,
        started_at: ~U[2026-01-01 00:00:00.000000Z],
        ended_at: ~U[2027-01-31 00:00:00.000000Z],
        form_count: 0,
        submission_count: 0,
        storage_count: 0
      })

      {:ok, period} =
        BillingCounts.reconcile_current_period(team.id, ~U[2026-01-02 00:00:00.000000Z])

      assert period.form_count == 1
      assert period.submission_count == 1
      assert period.storage_count == 1234
    end
  end

  defp plan(attrs) do
    struct(
      %Plan{
        name: "Test",
        limit_forms: 5,
        limit_submissions: 100,
        limit_storage: 5_000_000
      },
      attrs
    )
  end
end
