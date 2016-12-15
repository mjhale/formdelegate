defmodule FormDelegate.FormTest do
  use FormDelegate.ModelCase

  alias FormDelegate.Form

  @valid_attrs %{forms_count: 42, host: "some content", form: "some content", verified: true}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Form.changeset(%Form{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Form.changeset(%Form{}, @invalid_attrs)
    refute changeset.valid?
  end
end
