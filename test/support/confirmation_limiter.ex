defmodule FormDelegate.ConfirmationLimiterSupport do
  @moduledoc false
  alias FormDelegate.Accounts.ConfirmationRateLimit

  @doc "Records `count` committed sends for `user_id`, each `seconds_ago` before now."
  def seed_sends(user_id, count, seconds_ago) do
    sent_at = DateTime.add(DateTime.utc_now(), -seconds_ago)
    for _ <- 1..count, do: ConfirmationRateLimit.record!(user_id, sent_at)
  end
end
