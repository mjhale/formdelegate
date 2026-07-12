defmodule FormDelegate.BillingCounts do
  import Ecto.Query, warn: false

  alias FormDelegate.BillingCounts.BillingCount
  alias FormDelegate.Forms.Form
  alias FormDelegate.Plans.Plan
  alias FormDelegate.Repo
  alias FormDelegate.Submissions.{Attachment, Submission}
  alias FormDelegate.Teams.Team

  @period_days 30
  @warning_threshold 0.8
  @grace_multiplier 2.25

  @moduledoc """
  Billing-period and usage-counter operations.

  Submissions are counted inside the current 30-day billing period. Forms and
  storage are current resource usage and carry across billing periods.
  """

  @doc """
  Gets the most recent billing count for a team.
  """
  def get_latest_billing_count_of_team(nil), do: nil

  def get_latest_billing_count_of_team(team_id) do
    Repo.one(latest_period_query(team_id))
  end

  @doc """
  Returns the current billing period, creating or rolling it forward if needed.
  """
  def current_period_for_team!(team_id, now \\ DateTime.utc_now()) do
    now = normalize_datetime(now)

    Repo.transaction(fn ->
      lock_team!(team_id)
      current_period_for_team_locked!(team_id, now)
    end)
    |> case do
      {:ok, %BillingCount{} = billing_count} -> billing_count
      {:error, reason} -> raise "unable to load billing period: #{inspect(reason)}"
    end
  end

  @doc """
  Updates a billing count.
  """
  def update_billing_count(%BillingCount{} = billing_count, attrs \\ %{}) do
    billing_count
    |> BillingCount.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Creates a billing count.
  """
  def create_billing_count(%BillingCount{} = billing_count, attrs \\ %{}) do
    billing_count
    |> BillingCount.create_changeset(attrs)
    |> Repo.insert()
  end

  def create_form_with_usage(team_id, %Plan{} = plan, fun) when is_function(fun, 0) do
    track_usage_delta(team_id, plan, %{form_count: 1}, fun)
  end

  def delete_form_with_usage(%Form{team_id: team_id, id: form_id}, %Plan{} = plan, fun)
      when is_function(fun, 0) do
    track_usage_delta(
      team_id,
      plan,
      fn ->
        %{form_count: -1, storage_count: -storage_count_for_form(form_id)}
      end,
      fun,
      check_limits?: false
    )
  end

  def create_submission_with_usage(team_id, %Plan{} = plan, attachments, fun)
      when is_function(fun, 0) do
    track_usage_delta(
      team_id,
      plan,
      %{submission_count: 1, storage_count: attachments_size!(attachments)},
      fun
    )
  end

  def usage_summary(%Team{id: team_id} = team, %Plan{} = plan, subscription \\ nil) do
    period = current_period_for_team!(team_id)

    %{
      team_id: team.id,
      plan: plan,
      subscription: subscription,
      period: %{
        started_at: period.started_at,
        ended_at: period.ended_at
      },
      usage: %{
        forms:
          count_usage(
            period.form_count,
            plan.limit_forms,
            unlimited?: plan.limit_forms == 0
          ),
        submissions: count_usage(period.submission_count, plan.limit_submissions),
        storage:
          storage_usage(
            period.storage_count,
            plan.limit_storage
          )
      }
    }
  end

  def reconcile_current_period(team_id, now \\ DateTime.utc_now()) do
    now = normalize_datetime(now)

    Repo.transaction(fn ->
      lock_team!(team_id)

      period = current_period_for_team_locked!(team_id, now)
      period_usage = calculated_current_usage(team_id, period: period)

      update_period_counts!(period, period_usage, mode: :replace)
    end)
  end

  def reconcile_all_current_periods(now \\ DateTime.utc_now()) do
    Team
    |> Repo.all()
    |> Enum.reduce_while(:ok, fn team, :ok ->
      case reconcile_current_period(team.id, now) do
        {:ok, _billing_count} -> {:cont, :ok}
        {:error, reason} -> {:halt, {:error, {team.id, reason}}}
      end
    end)
  end

  def grace_multiplier, do: @grace_multiplier
  def warning_threshold, do: @warning_threshold

  defp track_usage_delta(team_id, %Plan{} = plan, delta, fun, opts \\ []) do
    now = DateTime.utc_now()
    check_limits? = Keyword.get(opts, :check_limits?, true)

    Repo.transaction(fn ->
      lock_team!(team_id)
      period = current_period_for_team_locked!(team_id, now)
      delta = resolve_delta(delta)

      with :ok <- maybe_check_limits(period, plan, delta, check_limits?),
           {:ok, value} <- run_usage_operation(fun) do
        update_period_counts!(period, delta)
        value
      else
        {:error, {:status_error, status, metadata}} ->
          Repo.rollback({:status_error, status, metadata})

        {:error, reason} ->
          Repo.rollback(reason)
      end
    end)
    |> normalize_usage_transaction_result()
  end

  defp resolve_delta(delta) when is_function(delta, 0), do: delta.()
  defp resolve_delta(delta), do: delta

  defp run_usage_operation(fun) do
    case fun.() do
      {:ok, value} -> {:ok, value}
      {:error, status, metadata} -> {:error, {:status_error, status, metadata}}
      {:error, reason} -> {:error, reason}
      value -> {:ok, value}
    end
  end

  defp maybe_check_limits(_period, _plan, _delta, false), do: :ok
  defp maybe_check_limits(period, plan, delta, true), do: check_limits(period, plan, delta)

  defp check_limits(%BillingCount{} = period, %Plan{} = plan, delta) do
    cond do
      exceeds_grace?(
        period.form_count,
        plan.limit_forms,
        Map.get(delta, :form_count, 0),
        unlimited?: plan.limit_forms == 0
      ) ->
        {:error, :plan_grace_limit_exceeded}

      exceeds_grace?(
        period.submission_count,
        plan.limit_submissions,
        Map.get(delta, :submission_count, 0)
      ) ->
        {:error, :plan_grace_limit_exceeded}

      exceeds_grace?(
        period.storage_count,
        plan.limit_storage,
        Map.get(delta, :storage_count, 0)
      ) ->
        {:error, :plan_grace_limit_exceeded}

      true ->
        :ok
    end
  end

  defp exceeds_grace?(used, limit, delta), do: exceeds_grace?(used, limit, delta, [])

  defp exceeds_grace?(used, limit, delta, opts) do
    if Keyword.get(opts, :unlimited?, false) do
      false
    else
      used + delta > grace_limit(limit)
    end
  end

  defp update_period_counts!(%BillingCount{} = period, attrs, opts \\ []) do
    mode = Keyword.get(opts, :mode, :increment)

    next_attrs =
      case mode do
        :replace ->
          attrs

        :increment ->
          %{
            form_count: max(period.form_count + Map.get(attrs, :form_count, 0), 0),
            submission_count:
              max(period.submission_count + Map.get(attrs, :submission_count, 0), 0),
            storage_count: max(period.storage_count + Map.get(attrs, :storage_count, 0), 0)
          }
      end

    period
    |> BillingCount.changeset(next_attrs)
    |> Repo.update!()
  end

  defp current_period_for_team_locked!(team_id, now) do
    case Repo.one(latest_period_query(team_id, lock?: true)) do
      nil ->
        create_period!(team_id, %{
          started_at: now,
          ended_at: DateTime.add(now, @period_days, :day),
          form_count: form_count_for_team(team_id),
          submission_count: 0,
          storage_count: storage_count_for_team(team_id)
        })

      %BillingCount{} = period ->
        if period_current?(period, now) do
          period
        else
          roll_period_forward!(team_id, period, now)
        end
    end
  end

  defp roll_period_forward!(team_id, %BillingCount{} = period, now) do
    started_at = period.ended_at || now
    ended_at = DateTime.add(started_at, @period_days, :day)

    next_period =
      create_period!(team_id, %{
        started_at: started_at,
        ended_at: ended_at,
        form_count: form_count_for_team(team_id),
        submission_count: 0,
        storage_count: storage_count_for_team(team_id)
      })

    if period_current?(next_period, now) do
      next_period
    else
      roll_period_forward!(team_id, next_period, now)
    end
  end

  defp period_current?(%BillingCount{ended_at: ended_at}, now) do
    DateTime.compare(now, ended_at) == :lt
  end

  defp create_period!(team_id, attrs) do
    %BillingCount{}
    |> BillingCount.create_changeset(Map.put(attrs, :team_id, team_id))
    |> Repo.insert!()
  end

  defp lock_team!(team_id) do
    Repo.one!(
      from team in Team,
        where: team.id == ^team_id,
        lock: "FOR UPDATE"
    )
  end

  defp latest_period_query(team_id, opts \\ []) do
    query =
      from bc in BillingCount,
        where: bc.team_id == ^team_id,
        order_by: [desc: bc.ended_at],
        limit: 1

    if Keyword.get(opts, :lock?, false) do
      from bc in query, lock: "FOR UPDATE"
    else
      query
    end
  end

  defp calculated_current_usage(team_id, period: %BillingCount{} = period) do
    %{
      form_count: form_count_for_team(team_id),
      submission_count: submission_count_for_period(team_id, period),
      storage_count: storage_count_for_team(team_id)
    }
  end

  defp form_count_for_team(team_id) do
    Repo.aggregate(from(form in Form, where: form.team_id == ^team_id), :count, :id)
  end

  defp submission_count_for_period(team_id, %BillingCount{} = period) do
    Repo.aggregate(
      from(submission in Submission,
        join: form in Form,
        on: form.id == submission.form_id,
        where:
          form.team_id == ^team_id and submission.inserted_at >= ^period.started_at and
            submission.inserted_at < ^period.ended_at
      ),
      :count,
      :id
    )
  end

  defp storage_count_for_team(team_id) do
    Repo.one(
      from attachment in Attachment,
        join: submission in Submission,
        on: submission.id == attachment.submission_id,
        join: form in Form,
        on: form.id == submission.form_id,
        where: form.team_id == ^team_id,
        select: fragment("COALESCE(sum(?), 0)", attachment.file_size)
    ) || 0
  end

  defp storage_count_for_form(form_id) do
    Repo.one(
      from attachment in Attachment,
        join: submission in Submission,
        on: submission.id == attachment.submission_id,
        where: submission.form_id == ^form_id,
        select: fragment("COALESCE(sum(?), 0)", attachment.file_size)
    ) || 0
  end

  defp attachments_size!(attachments) when is_list(attachments) do
    attachments
    |> Enum.map(fn attachment ->
      {:ok, %File.Stat{size: size}} = File.stat(attachment["file"].path)
      size
    end)
    |> Enum.sum()
  end

  defp attachments_size!(_attachments), do: 0

  defp count_usage(used, limit, opts \\ []) do
    if Keyword.get(opts, :unlimited?, false) do
      %{
        used: used,
        limit: limit,
        grace_limit: nil,
        status: :unlimited
      }
    else
      %{
        used: used,
        limit: limit,
        grace_limit: grace_limit(limit),
        status: usage_status(used, limit)
      }
    end
  end

  defp storage_usage(used, limit) do
    %{
      used_bytes: used,
      limit_bytes: limit,
      grace_limit_bytes: grace_limit(limit),
      status: usage_status(used, limit)
    }
  end

  defp usage_status(used, limit) do
    cond do
      used > grace_limit(limit) -> :blocked
      used >= limit -> :over_limit
      used >= warning_limit(limit) -> :warning
      true -> :ok
    end
  end

  defp warning_limit(limit), do: ceil(limit * @warning_threshold)
  defp grace_limit(limit), do: ceil(limit * @grace_multiplier)

  defp normalize_usage_transaction_result({:ok, value}), do: {:ok, value}

  defp normalize_usage_transaction_result({:error, {:status_error, status, metadata}}),
    do: {:error, status, metadata}

  defp normalize_usage_transaction_result({:error, reason}), do: {:error, reason}

  defp normalize_datetime(%DateTime{} = datetime), do: datetime

  defp normalize_datetime(%NaiveDateTime{} = datetime) do
    DateTime.from_naive!(datetime, "Etc/UTC")
  end
end
