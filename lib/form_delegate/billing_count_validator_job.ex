defmodule FormDelegate.BillingCountValidatorJob do
  @behaviour Rihanna.Job

  alias FormDelegate.{BillingCounts, BillingCounts.BillingCount}
  alias FormDelegate.Teams

  import Logger, only: [debug: 1]

  def perform([current_time]) do
    # @TODO: Ensure only one validator instance is running

    debug("FD: Running billing count validator at #{current_time}")
    renew_billing_count_periods(current_time)

    next_job_due_at = DateTime.add(current_time, :timer.hours(1), :millisecond)

    Rihanna.schedule(FormDelegate.BillingCountValidatorJob, [next_job_due_at], in: :timer.hours(1))
  end

  defp renew_billing_count_periods(current_time) do
    teams = Teams.list_teams()

    Enum.each(teams, fn team ->
      latest_billing_count = BillingCounts.get_latest_billing_count_of_team(team.id)

      if DateTime.diff(current_time, latest_billing_count.ended_at) > 0 do
        debug("FD: Creating new billing count period for #{team.id} at #{current_time}")

        {:ok, _billing_count} =
          BillingCounts.create_billing_count(%BillingCount{}, %{
            form_count: latest_billing_count.form_count,
            team_id: team.id
          })
      end

      :ok
    end)
  end
end
