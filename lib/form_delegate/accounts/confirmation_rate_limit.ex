defmodule FormDelegate.Accounts.ConfirmationRateLimit do
  @moduledoc """
  Account-scoped confirmation email limits backed by `confirmation_email_sends`.

  Only committed sends are counted: callers record a send in the same
  transaction that enqueues the email, so a rollback never consumes an
  allowance. Callers must hold the account's row lock while checking and
  recording so concurrent requests cannot both pass the same window.
  """
  import Ecto.Query

  alias FormDelegate.Accounts.ConfirmationSend
  alias FormDelegate.Repo

  @rules [cooldown: {60, 1}, hourly: {3_600, 5}, daily: {86_400, 10}]
  @longest_window @rules |> Keyword.values() |> Enum.map(&elem(&1, 0)) |> Enum.max()

  @type rule :: :cooldown | :hourly | :daily

  @doc "Seconds a caller must wait after a successful send."
  @spec cooldown_seconds() :: pos_integer()
  def cooldown_seconds, do: @rules |> Keyword.fetch!(:cooldown) |> elem(0)

  @spec check(integer(), DateTime.t()) :: :ok | {:error, {:rate_limited, pos_integer(), rule()}}
  def check(user_id, now \\ DateTime.utc_now()) do
    since = DateTime.add(now, -@longest_window)

    sent =
      Repo.all(
        from s in ConfirmationSend,
          where: s.user_id == ^user_id and s.inserted_at > ^since,
          select: s.inserted_at
      )

    Enum.find_value(@rules, :ok, fn {rule, {window, limit}} ->
      in_window = Enum.filter(sent, &(DateTime.diff(now, &1, :microsecond) < window * 1_000_000))

      if length(in_window) >= limit do
        oldest = Enum.min(in_window, DateTime)
        remaining = window * 1_000_000 - DateTime.diff(now, oldest, :microsecond)
        {:error, {:rate_limited, max(1, div(remaining + 999_999, 1_000_000)), rule}}
      end
    end)
  end

  @spec record_changeset(integer(), DateTime.t()) :: Ecto.Changeset.t()
  def record_changeset(user_id, now \\ DateTime.utc_now()) do
    Ecto.Changeset.change(%ConfirmationSend{}, user_id: user_id, inserted_at: now)
  end

  @spec record!(integer(), DateTime.t()) :: ConfirmationSend.t()
  def record!(user_id, now \\ DateTime.utc_now()),
    do: user_id |> record_changeset(now) |> Repo.insert!()

  @doc "Deletes sends older than every window; they can no longer affect a decision."
  @spec prune(DateTime.t()) :: non_neg_integer()
  def prune(now \\ DateTime.utc_now()) do
    since = DateTime.add(now, -@longest_window)
    {count, _} = Repo.delete_all(from s in ConfirmationSend, where: s.inserted_at <= ^since)
    count
  end
end
