defmodule FormDelegate.Accounts.ConfirmationRequestsTest do
  use FormDelegate.DataCase
  import FormDelegate.Factory

  alias FormDelegate.Accounts.{
    ConfirmationRateLimit,
    ConfirmationRequests,
    ConfirmationSend,
    User
  }

  alias FormDelegate.Jobs.UserConfirmationEmail

  # Named, queue-less Oban instances exercise its insertion failure contracts
  # without swapping the application's global Oban process or making provider calls.
  defmodule FailingEngine do
    use FormDelegate.TestObanEngine

    @impl true

    def insert_job(_conf, changeset, _opts) do
      {:error, Ecto.Changeset.add_error(changeset, :args, "synthetic enqueue failure")}
    end
  end

  defmodule LockedEngine do
    use FormDelegate.TestObanEngine

    @impl true

    def insert_job(_conf, changeset, _opts) do
      {:ok, %{Ecto.Changeset.apply_changes(changeset) | conflict?: true, id: nil}}
    end
  end

  setup do
    user = insert(:user, confirmation_sent_at: DateTime.add(DateTime.utc_now(), -6 * 86_400))
    {:ok, user: user}
  end

  test "enqueue failure preserves the token and consumes no allowance", %{user: user} do
    start_oban(FailingEngine)
    assert {:error, %Ecto.Changeset{}} = ConfirmationRequests.request(user, FailingEngine)
    assert Repo.get!(User, user.id).confirmation_token == user.confirmation_token
    assert Repo.aggregate(Oban.Job, :count) == 0
    assert :ok = ConfirmationRateLimit.check(user.id)
  end

  test "uniqueness lock conflict with no job id returns a retry and preserves the token", %{
    user: user
  } do
    start_oban(LockedEngine)
    assert {:ok, {:rate_limited, 60}} = ConfirmationRequests.request(user, LockedEngine)
    assert Repo.get!(User, user.id).confirmation_token == user.confirmation_token
    assert Repo.aggregate(Oban.Job, :count) == 0
  end

  test "token update failure rolls back an already inserted job", %{user: user} do
    # This constraint is isolated by the test's SQL sandbox transaction.
    Repo.query!(
      "ALTER TABLE users ADD CONSTRAINT confirmation_test_reject_update CHECK (id != #{user.id}) NOT VALID"
    )

    Oban.Testing.with_testing_mode(:manual, fn ->
      assert_raise Ecto.ConstraintError, fn -> ConfirmationRequests.request(user) end
    end)

    assert Repo.aggregate(Oban.Job, :count) == 0
    assert Repo.get!(User, user.id).confirmation_token == user.confirmation_token
    assert :ok = ConfirmationRateLimit.check(user.id)
  end

  test "concurrent requests on separate database connections queue only one job" do
    sandbox = Ecto.Adapters.SQL.Sandbox
    sandbox.mode(Repo, :manual)

    user =
      sandbox.unboxed_run(Repo, fn ->
        insert(:user, confirmation_sent_at: DateTime.add(DateTime.utc_now(), -120))
      end)

    try do
      outcomes =
        Oban.Testing.with_testing_mode(:manual, fn ->
          1..8
          |> Task.async_stream(
            fn _ ->
              sandbox.unboxed_run(Repo, fn ->
                Oban.Testing.with_testing_mode(:manual, fn ->
                  ConfirmationRequests.request(user)
                end)
              end)
            end,
            max_concurrency: 8
          )
          |> Enum.map(fn {:ok, outcome} -> outcome end)
        end)

      assert Enum.count(outcomes, &(&1 == {:ok, :sent})) == 1
      assert Enum.count(outcomes, &match?({:ok, {:rate_limited, _}}, &1)) == 7

      sandbox.unboxed_run(Repo, fn ->
        assert Repo.aggregate(
                 from(j in Oban.Job,
                   where: fragment("?->>'user_id'", j.args) == ^to_string(user.id)
                 ),
                 :count
               ) == 1
      end)
    after
      sandbox.unboxed_run(Repo, fn ->
        Repo.delete_all(
          from j in Oban.Job,
            where: fragment("?->>'user_id'", j.args) == ^to_string(user.id)
        )

        Repo.delete!(user)
      end)
    end
  end

  test "telemetry reports outcomes without account, address, or token identifiers", %{user: user} do
    handler = {__MODULE__, make_ref()}

    :telemetry.attach(
      handler,
      [:form_delegate, :confirmation_resend, :result],
      &__MODULE__.handle_event/4,
      self()
    )

    on_exit(fn -> :telemetry.detach(handler) end)

    Oban.Testing.with_testing_mode(:manual, fn ->
      assert {:ok, :sent} = ConfirmationRequests.request(user)
      assert {:ok, {:rate_limited, _}} = ConfirmationRequests.request(user)
    end)

    assert_receive {:event, %{count: 1}, %{outcome: :allowed} = allowed}
    assert Map.keys(allowed) == [:outcome]

    assert_receive {:event, %{count: 1}, %{outcome: :throttled, rule: :cooldown} = denied}

    assert Enum.sort(Map.keys(denied)) == [:outcome, :rule]
  end

  test "a successful send records exactly one committed send", %{user: user} do
    Oban.Testing.with_testing_mode(:manual, fn ->
      assert {:ok, :sent} = ConfirmationRequests.request(user)
      assert {:ok, {:rate_limited, _}} = ConfirmationRequests.request(user)
    end)

    assert Repo.aggregate(ConfirmationSend, :count) == 1
  end

  test "completed jobs allow another send when the account windows permit it", %{user: user} do
    Oban.Testing.with_testing_mode(:manual, fn ->
      job = %{user_id: user.id} |> UserConfirmationEmail.new() |> Oban.insert!()
      Repo.update!(Ecto.Changeset.change(job, state: "completed"))
      assert {:ok, :sent} = ConfirmationRequests.request(user)
      assert Repo.aggregate(Oban.Job, :count) == 2
    end)
  end

  def handle_event(_event, measurements, metadata, pid),
    do: send(pid, {:event, measurements, metadata})

  defp start_oban(engine) do
    start_supervised!(
      {Oban,
       name: engine,
       repo: Repo,
       engine: engine,
       testing: :manual,
       queues: false,
       plugins: false,
       peer: false}
    )
  end
end
