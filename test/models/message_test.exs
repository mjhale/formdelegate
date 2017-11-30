defmodule FormDelegate.MessageTest do
  use FormDelegate.ModelCase

  alias FormDelegate.Message

  @valid_attrs %{
    content: "A brief message.",
    sender: "M. Stark",
    user_id: 1,
  }
  @invalid_attrs %{
    content: "A brief message.",
  }

  test "changeset with valid attributes" do
    changeset = Message.changeset(%Message{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Message.changeset(%Message{}, @invalid_attrs)
    refute changeset.valid?
  end
end
