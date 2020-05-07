defmodule FormDelegate.Messages.FlaggedType do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Messages.{Message, FlaggedType}

  schema "flagged_types" do
    field :type, :string
    field :description, :string

    has_many :messages, Message

    timestamps()
  end

  @doc false
  def changeset(%FlaggedType{} = flagged_type, attrs \\ %{}) do
    flagged_type
    |> cast(attrs, [:type])
    |> validate_required(:type)
    |> unique_constraint(:type)
  end
end
