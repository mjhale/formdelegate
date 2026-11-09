defmodule FormDelegate.Jobs.UserConfirmationEmailTest do
  use FormDelegate.DataCase
  import FormDelegate.Factory
  use Bamboo.Test

  alias FormDelegate.Jobs.UserConfirmationEmail

  test "unfinished jobs are unique per user even when older than a resend window" do
    Oban.Testing.with_testing_mode(:manual, fn ->
      for state <- Oban.Job.unique_states(:incomplete) do
        user = insert(:user)
        job = %{user_id: user.id} |> UserConfirmationEmail.new() |> Oban.insert!()

        Repo.update!(
          Ecto.Changeset.change(job,
            state: to_string(state),
            inserted_at: DateTime.add(DateTime.utc_now(), -86_401)
          )
        )

        duplicate = %{user_id: user.id} |> UserConfirmationEmail.new() |> Oban.insert!()
        assert duplicate.conflict?
        assert duplicate.id == job.id
      end
    end)
  end

  test "different users and completed or cancelled jobs allow a fresh job" do
    Oban.Testing.with_testing_mode(:manual, fn ->
      for state <- [:completed, :cancelled, :discarded] do
        user = insert(:user)
        other = insert(:user)
        job = %{user_id: user.id} |> UserConfirmationEmail.new() |> Oban.insert!()
        other_job = %{user_id: other.id} |> UserConfirmationEmail.new() |> Oban.insert!()
        refute other_job.conflict?
        Repo.update!(Ecto.Changeset.change(job, state: to_string(state)))
        fresh = %{user_id: user.id} |> UserConfirmationEmail.new() |> Oban.insert!()
        refute fresh.conflict?
        refute fresh.id == job.id
      end
    end)
  end

  test "retries stop after five attempts so a failing send cannot block resends for days" do
    assert %{changes: %{max_attempts: 5}} = UserConfirmationEmail.new(%{user_id: 1})
  end

  test "a queued job skips an owner who has since verified" do
    user = insert(:user, confirmed_at: DateTime.utc_now())
    assert :ok = UserConfirmationEmail.perform(%Oban.Job{args: %{"user_id" => user.id}})
    assert_no_emails_delivered()
  end
end
