# Billing count periods are 30 days long from account creation time, and
# we need to create a new reporting period once the previous one ends.

defmodule FormDelegate.Jobs.BillingCounts do
  use Oban.Worker,
    queue: :billing_count,
    max_attempts: 5,
    unique: [period: 300, timestamp: :scheduled_at]

  alias FormDelegate.BillingCounts
  alias FormDelegate.Teams

  import Logger, only: [debug: 1]

  # Check if new billing count periods are needed every five minutes
  @five_minutes 60 * 5

  def schedule_next(current_time \\ DateTime.utc_now()) do
    next_job_time = DateTime.add(current_time, :timer.minutes(5), :millisecond)

    %{"current_time" => DateTime.to_iso8601(next_job_time)}
    |> new(schedule_in: @five_minutes)
    |> Oban.insert()
  end

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"current_time" => current_time}, attempt: attempt}) do
    {:ok, current_time, _offset} = DateTime.from_iso8601(current_time)

    if attempt == 1 do
      schedule_next(current_time)
    end

    renew_billing_count_periods(current_time)
  end

  defp renew_billing_count_periods(current_time) do
    teams = Teams.list_teams()

    Enum.each(teams, fn team ->
      debug("FD: Reconciling billing count period for #{team.id} at #{current_time}")
      {:ok, _billing_count} = BillingCounts.reconcile_current_period(team.id, current_time)
    end)
  end
end
