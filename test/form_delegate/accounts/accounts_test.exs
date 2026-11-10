defmodule FormDelegate.AccountsTest do
  use FormDelegate.DataCase

  import FormDelegate.Factory

  alias FormDelegate.Accounts
  alias FormDelegate.Accounts.ConfirmationSend
  alias FormDelegate.Jobs.WelcomeEmail
  alias FormDelegate.Memberships.Membership

  # A named, queue-less Oban instance whose inserts fail, so registration's
  # enqueue failure path runs without replacing the application's Oban.
  defmodule FailingEngine do
    use FormDelegate.TestObanEngine

    @impl true
    def insert_job(_conf, changeset, _opts) do
      {:error, Ecto.Changeset.add_error(changeset, :args, "synthetic enqueue failure")}
    end
  end

  describe "users" do
    alias FormDelegate.Accounts.User

    @valid_registration_attrs %{
      captcha: "10000000-aaaa-bbbb-cccc-000000000001",
      user: %{
        email: "user@formdelegate.com",
        name: "Form User",
        password: "a valid password!"
      }
    }

    @invalid_registration_attrs %{
      captcha: nil,
      user: %{
        email: nil,
        password: nil
      }
    }

    @update_attrs %{
      email: "updateduser@formdelegate.com",
      name: "Updated Form User"
    }

    @invalid_update_attrs %{email: nil, name: nil, password: nil}

    @valid_password_attrs %{
      "current_password" => "a valid password!",
      "password" => "a different valid password!",
      "password_confirmation" => "a different valid password!"
    }

    def user_fixture(attrs \\ %{}) do
      {:ok, %User{} = user} =
        attrs
        |> Enum.into(@valid_registration_attrs)
        |> Accounts.register_user()

      user
    end

    test "list_users/0 returns all users" do
      %{id: id} = user_fixture()
      assert [%User{id: ^id}] = Accounts.list_users()
    end

    test "get_user!/1 returns the user with given id" do
      %{id: id} = user_fixture()
      assert %User{id: ^id} = Accounts.get_user!(id)
    end

    test "register_user/1 with valid data creates a user" do
      assert {:ok, user} = Accounts.register_user(@valid_registration_attrs)
      assert user.email == "user@formdelegate.com"
      assert user.is_admin == false
      assert user.name == "Form User"
      assert [send] = Repo.all(FormDelegate.Accounts.ConfirmationSend)
      assert send.user_id == user.id
      assert send.inserted_at == user.confirmation_sent_at
    end

    test "register_user/2 enqueues the welcome email in the registration transaction" do
      start_oban(:registration_manual_oban, Oban.Engines.Basic)

      assert {:ok, user} =
               Accounts.register_user(@valid_registration_attrs, :registration_manual_oban)

      assert [%Oban.Job{worker: worker, args: args}] = Repo.all(Oban.Job)
      assert worker == inspect(WelcomeEmail)
      assert args == %{"user_id" => user.id}
      assert [%ConfirmationSend{}] = Repo.all(ConfirmationSend)
    end

    test "register_user/2 rolls back the account and send record when enqueueing fails" do
      start_oban(FailingEngine, FailingEngine)

      assert {:error, :welcome_email_unavailable} =
               Accounts.register_user(@valid_registration_attrs, FailingEngine)

      assert Repo.aggregate(User, :count) == 0
      assert Repo.aggregate(ConfirmationSend, :count) == 0
      assert Repo.aggregate(Oban.Job, :count) == 0
    end

    test "register_user/1 with a registered email returns a nested field error" do
      assert {:ok, _user} = Accounts.register_user(@valid_registration_attrs)
      assert {:error, changeset} = Accounts.register_user(@valid_registration_attrs)
      assert "has already been taken" in errors_on(changeset).user.email
      assert Repo.aggregate(User, :count) == 1
      assert Repo.aggregate(ConfirmationSend, :count) == 1
    end

    test "register_user/1 with invalid data returns error changeset" do
      assert {:error, changeset} = Accounts.register_user(@invalid_registration_attrs)
      assert "can't be blank" in errors_on(changeset).user.email
    end

    test "update_user/2 with valid data updates the user" do
      user = user_fixture()
      assert {:ok, user} = Accounts.update_user(user, @update_attrs)
      assert %User{} = user
      assert user.email == "updateduser@formdelegate.com"
      assert user.is_admin == false
      assert user.name == "Updated Form User"
    end

    test "update_user/2 with invalid data returns error changeset" do
      user = user_fixture()
      assert {:error, changeset} = Accounts.update_user(user, @invalid_update_attrs)
      assert "can't be blank" in errors_on(changeset).email
      assert %{email: ["can't be blank"]} = errors_on(changeset)
    end

    test "change_user_password/2 with valid data updates the password and clears reset token fields" do
      user = user_fixture()
      {:ok, %User{} = user} = Accounts.create_reset_password_token(user)

      assert {:ok, %User{} = updated_user} =
               Accounts.change_user_password(user, @valid_password_attrs)

      assert updated_user.auth_token_version == user.auth_token_version + 1
      assert updated_user.reset_password_token == nil
      assert updated_user.reset_password_sent_at == nil

      assert {:ok, %User{id: user_id}} =
               Accounts.authenticate_user(%{
                 email: user.email,
                 password: "a different valid password!"
               })

      assert user_id == user.id

      assert {:error, :invalid_credentials} =
               Accounts.authenticate_user(%{email: user.email, password: "a valid password!"})
    end

    test "change_user_password/2 with a bad current password returns error changeset" do
      user = user_fixture()

      assert {:error, changeset} =
               Accounts.change_user_password(
                 user,
                 Map.put(@valid_password_attrs, "current_password", "the wrong current password")
               )

      assert %{current_password: ["is invalid"]} = errors_on(changeset)

      assert Accounts.get_user!(user.id).auth_token_version == user.auth_token_version

      assert {:ok, %User{id: user_id}} =
               Accounts.authenticate_user(%{email: user.email, password: "a valid password!"})

      assert user_id == user.id
    end

    test "change_user_password/2 with a password confirmation mismatch returns error changeset" do
      user = user_fixture()

      assert {:error, changeset} =
               Accounts.change_user_password(
                 user,
                 Map.put(@valid_password_attrs, "password_confirmation", "not the same password")
               )

      assert "does not match confirmation" in errors_on(changeset).password_confirmation
    end

    test "change_user_password/2 with a weak password returns error changeset" do
      user = user_fixture()

      assert {:error, changeset} =
               Accounts.change_user_password(
                 user,
                 Map.merge(@valid_password_attrs, %{
                   "password" => "short",
                   "password_confirmation" => "short"
                 })
               )

      assert "should be at least 8 character(s)" in errors_on(changeset).password
    end

    test "reset_user_password/2 increments auth token version" do
      user = user_fixture()
      {:ok, %User{} = user} = Accounts.create_reset_password_token(user)

      assert {:ok, %User{} = updated_user} =
               Accounts.reset_user_password(user, %{"password" => "a reset valid password!"})

      assert updated_user.auth_token_version == user.auth_token_version + 1
    end

    test "delete_user/1 deletes the user" do
      user = user_fixture()
      add_team_member(user, is_billing_account: true)

      assert {:ok, %User{}} = Accounts.delete_user(user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_user!(user.id) end
    end

    test "delete_user/1 blocks deleting the final team member" do
      user = user_fixture()

      assert {:error, :last_team_member} = Accounts.delete_user(user)
      assert %User{} = Accounts.get_user!(user.id)
    end

    test "delete_user/1 blocks deleting the final team admin" do
      user = user_fixture()
      add_team_member(user, is_billing_account: false)

      assert {:error, :last_team_admin} = Accounts.delete_user(user)
      assert %User{} = Accounts.get_user!(user.id)
    end

    test "change_user/1 returns a user changeset" do
      user = user_fixture()
      assert %Ecto.Changeset{} = Accounts.change_user(user)
    end
  end

  defp add_team_member(user, attrs) do
    team = user.memberships |> List.first() |> Map.fetch!(:team)
    member = insert(:user)

    Repo.insert!(%Membership{
      user_id: member.id,
      team_id: team.id,
      is_billing_account: Keyword.fetch!(attrs, :is_billing_account)
    })
  end

  defp start_oban(name, engine) do
    start_supervised!(
      {Oban,
       name: name,
       repo: Repo,
       engine: engine,
       testing: :manual,
       queues: false,
       plugins: false,
       peer: false}
    )
  end
end
