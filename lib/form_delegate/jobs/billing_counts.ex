# Billing count periods are 30 days long from account creation time, and
# we need to create a new reporting period once the previous one ends.

defmodule FormDelegate.Jobs.BillingCounts do
  use Oban.Worker,
    queue: :billing_count,
    max_attempts: 5,
    unique: [period: 300, timestamp: :scheduled_at]

  alias FormDelegate.{BillingCounts, BillingCounts.BillingCount}
  alias FormDelegate.Teams

  import Logger, only: [debug: 1]

  # Check if new billing count periods are needed every five minutes
  @five_minutes 60 * 5

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"current_time" => current_time}, attempt: 1}) do
    {:ok, current_time, _offset} = DateTime.from_iso8601(current_time)

    next_job_time = DateTime.add(current_time, :timer.minutes(5), :millisecond)

    %{"current_time" => next_job_time}
    |> new(schedule_in: @five_minutes)
    |> Oban.insert!()

    renew_billing_count_periods(current_time)
  end

  def perform(%Oban.Job{args: %{"current_time" => current_time}}) do
    {:ok, current_time, _offset} = DateTime.from_iso8601(current_time)

    renew_billing_count_periods(current_time)
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
    end)
  end
end
