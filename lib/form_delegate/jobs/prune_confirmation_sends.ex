defmodule FormDelegate.Jobs.PruneConfirmationSends do
  @moduledoc "Removes confirmation send records older than the longest rate-limit window."
  use Oban.Worker, queue: :default, max_attempts: 3

  alias FormDelegate.Accounts.ConfirmationRateLimit

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    ConfirmationRateLimit.prune()
    :ok
  end
end
