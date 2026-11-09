defmodule FormDelegate.Accounts.ConfirmationRateLimitTest do
  use FormDelegate.DataCase, async: true
  import FormDelegate.Factory

  alias FormDelegate.Accounts.{ConfirmationRateLimit, ConfirmationSend}

  setup do
    {:ok, user: insert(:user), now: DateTime.utc_now()}
  end

  test "an account with no sends is allowed", %{user: user, now: now} do
    assert :ok = ConfirmationRateLimit.check(user.id, now)
  end

  test "one send blocks for the remaining cooldown, rounded up", %{user: user, now: now} do
    ConfirmationRateLimit.record!(user.id, DateTime.add(now, -20_500, :millisecond))
    assert {:error, {:rate_limited, 40, :cooldown}} = ConfirmationRateLimit.check(user.id, now)
    assert :ok = ConfirmationRateLimit.check(user.id, DateTime.add(now, 40))
  end

  test "five sends in the rolling hour block until the oldest leaves it", %{
    user: user,
    now: now
  } do
    for seconds <- [3_000, 2_000, 1_000, 500, 100],
        do: ConfirmationRateLimit.record!(user.id, DateTime.add(now, -seconds))

    assert {:error, {:rate_limited, 600, :hourly}} = ConfirmationRateLimit.check(user.id, now)
    assert :ok = ConfirmationRateLimit.check(user.id, DateTime.add(now, 600))
  end

  test "ten sends in the rolling day block until the oldest leaves it", %{user: user, now: now} do
    for hours <- 2..11,
        do: ConfirmationRateLimit.record!(user.id, DateTime.add(now, -hours * 3_600))

    # The oldest send is 11 hours old, so it leaves the day window in 13 hours.
    assert {:error, {:rate_limited, 46_800, :daily}} = ConfirmationRateLimit.check(user.id, now)
    assert :ok = ConfirmationRateLimit.check(user.id, DateTime.add(now, 46_800))
  end

  test "limits are scoped to the account", %{user: user, now: now} do
    other = insert(:user)
    ConfirmationRateLimit.record!(other.id, now)
    assert :ok = ConfirmationRateLimit.check(user.id, now)
  end

  test "pruning removes only sends outside every window", %{user: user, now: now} do
    ConfirmationRateLimit.record!(user.id, DateTime.add(now, -86_401))
    recent = ConfirmationRateLimit.record!(user.id, DateTime.add(now, -86_000))

    assert ConfirmationRateLimit.prune(now) == 1
    assert [%ConfirmationSend{id: id}] = Repo.all(ConfirmationSend)
    assert id == recent.id
  end

  test "deleting an account removes its sends", %{user: user, now: now} do
    ConfirmationRateLimit.record!(user.id, now)
    Repo.delete!(user)
    assert Repo.aggregate(ConfirmationSend, :count) == 0
  end
end
