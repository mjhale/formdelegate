defmodule FormDelegate.AccountsTest do
  use FormDelegate.DataCase

  alias FormDelegate.Accounts

  describe "users" do
    alias FormDelegate.Accounts.User

    @valid_attrs %{
      email: "user@formdelegate.com",
      name: "Form User",
      password: "a valid password!"
    }
    @update_attrs %{
      email: "updateduser@formdelegate.com",
      name: "Updated Form User"
    }
    @invalid_attrs %{email: nil, name: nil, password: nil}

    def user_fixture(attrs \\ %{}) do
      {:ok, %User{} = user} =
        attrs
        |> Enum.into(@valid_attrs)
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
      assert {:ok, user} = Accounts.register_user(@valid_attrs)
      assert user.email == "user@formdelegate.com"
      assert user.is_admin == false
      assert user.name == "Form User"
    end

    test "register_user/1 with invalid data returns error changeset" do
      assert {:error, changeset} = Accounts.register_user(@invalid_attrs)
      assert "can't be blank" in errors_on(changeset).email
      assert %{email: ["can't be blank"]} = errors_on(changeset)
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
      assert {:error, changeset} = Accounts.update_user(user, @invalid_attrs)
      assert "can't be blank" in errors_on(changeset).email
      assert %{email: ["can't be blank"]} = errors_on(changeset)
    end

    test "delete_user/1 deletes the user" do
      user = user_fixture()
      assert {:ok, %User{}} = Accounts.delete_user(user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_user!(user.id) end
    end

    test "change_user/1 returns a user changeset" do
      user = user_fixture()
      assert %Ecto.Changeset{} = Accounts.change_user(user)
    end
  end
end
