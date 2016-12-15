defmodule FormDelegate.AccountTest do
  use FormDelegate.ModelCase

  alias FormDelegate.Account

  @valid_attrs %{
    password_hash: "some password hash",
    password: "some password",
    name: "Joseph",
    email: "joe@joe.com",
  }
  @invalid_attrs %{
    password_hash: "password hash",
    password: "pass",
    name: "Joseph",
    email: "joe@joe.com",
  }

  test "changeset with valid attributes" do
    changeset = Account.changeset(%Account{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Account.changeset(%Account{}, @invalid_attrs)
    refute changeset.valid?
  end

  test "password_hash value gets set to a hash" do
    changeset = Account.changeset(%Account{}, @valid_attrs)
    assert Comeonin.Pbkdf2.checkpw(@valid_attrs.password, Ecto.Changeset.get_change(changeset, :password_hash))
  end
end
