defmodule FormDelegate.IntegrationTest do
  use FormDelegate.ModelCase

  alias FormDelegate.Integration

  @valid_attrs %{type: "e-mail"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Integration.changeset(%Integration{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Integration.changeset(%Integration{}, @invalid_attrs)
    refute changeset.valid?
  end
end
