defmodule FormDelegate.Accounts.ConfirmationRequests do
  @moduledoc "Account-scoped confirmation resend limits and transactional mail enqueueing."
  import Ecto.Query

  alias FormDelegate.Accounts.{ConfirmationRateLimit, User}
  alias FormDelegate.Jobs.UserConfirmationEmail
  alias FormDelegate.Repo

  # A resent link must stay usable for at least this long, or the token is rotated.
  @min_token_remaining 86_400
  @event [:form_delegate, :confirmation_resend, :result]

  @spec request(User.t(), Oban.name()) ::
          {:ok, :sent | :already_verified | :already_queued | {:rate_limited, pos_integer()}}
          | {:error, term()}
  def request(%User{id: user_id}, oban \\ Oban) do
    result =
      Repo.transaction(fn ->
        # Serialize this account's token and enqueue decisions across concurrent requests.
        user = Repo.one!(from u in User, where: u.id == ^user_id, lock: "FOR UPDATE")
        resend(user, DateTime.utc_now(), oban)
      end)

    report_result(result)
  end

  defp resend(%User{confirmed_at: confirmed_at}, _now, _oban) when not is_nil(confirmed_at),
    do: :already_verified

  defp resend(user, now, oban) do
    with :ok <- ConfirmationRateLimit.check(user.id, now),
         {:ok, job} <- Oban.insert(oban, UserConfirmationEmail.new(%{user_id: user.id})) do
      ensure_new_job(job)
      ensure_valid_token(user, now)
      # Recorded in this transaction so only committed sends consume an allowance.
      ConfirmationRateLimit.record!(user.id, now)
      :sent
    else
      {:error, reason} -> Repo.rollback(reason)
    end
  end

  # Oban may return a conflict with no persisted id when its uniqueness lock is busy.
  # Its Job.t() id type is narrower than this documented insertion result.
  # Suppress only the upstream-induced match warning on this tested boundary.
  @dialyzer {:no_match, ensure_new_job: 1}
  @typep inserted_job :: %Oban.Job{id: integer() | nil}
  @spec ensure_new_job(inserted_job()) :: :ok | no_return()
  defp ensure_new_job(%Oban.Job{conflict?: true, id: nil}),
    do: Repo.rollback({:rate_limited, 60, :job_lock})

  defp ensure_new_job(%Oban.Job{conflict?: true}), do: Repo.rollback(:already_queued)
  defp ensure_new_job(%Oban.Job{}), do: :ok

  defp ensure_valid_token(user, now) do
    if User.confirmation_token_remaining(user, now) >= @min_token_remaining do
      user
    else
      case user |> User.reset_confirmation_changeset() |> Repo.update() do
        {:ok, updated} -> updated
        {:error, reason} -> Repo.rollback(reason)
      end
    end
  end

  defp report_result({:error, {:rate_limited, seconds, rule}}) do
    emit(:throttled, %{rule: rule})
    {:ok, {:rate_limited, seconds}}
  end

  defp report_result({:error, :already_queued}) do
    emit(:duplicate_job)
    {:ok, :already_queued}
  end

  defp report_result({:ok, :sent} = result) do
    emit(:allowed)
    result
  end

  defp report_result({:ok, :already_verified} = result) do
    emit(:already_verified)
    result
  end

  defp report_result({:error, _reason} = result) do
    emit(:failed)
    result
  end

  defp emit(outcome, metadata \\ %{}) do
    :telemetry.execute(@event, %{count: 1}, Map.put(metadata, :outcome, outcome))
  end
end
