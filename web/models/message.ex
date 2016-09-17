defmodule FormDelegate.Message do
  use FormDelegate.Web, :model

  schema "messages" do
    field :content, :string, null: false
    field :sender_name, :string, null: false

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:content, :sender_name])
    |> validate_required([:content, :sender_name])
  end
end
