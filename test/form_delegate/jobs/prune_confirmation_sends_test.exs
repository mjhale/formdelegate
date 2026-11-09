defmodule FormDelegate.Jobs.PruneConfirmationSendsTest do
  use FormDelegate.DataCase, async: true
  import FormDelegate.Factory

  alias FormDelegate.Accounts.{ConfirmationRateLimit, ConfirmationSend}
  alias FormDelegate.Jobs.PruneConfirmationSends

  test "perform deletes only sends outside every rate-limit window" do
    user = insert(:user)
    now = DateTime.utc_now()
    ConfirmationRateLimit.record!(user.id, DateTime.add(now, -86_401))
    recent = ConfirmationRateLimit.record!(user.id, DateTime.add(now, -60))

    assert :ok = PruneConfirmationSends.perform(%Oban.Job{args: %{}})
    assert [%ConfirmationSend{id: id}] = Repo.all(ConfirmationSend)
    assert id == recent.id
  end
end
