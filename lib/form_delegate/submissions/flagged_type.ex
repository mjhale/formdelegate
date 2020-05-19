defmodule FormDelegate.Submissions.FlaggedType do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Submissions.{Submission, FlaggedType}

  schema "flagged_types" do
    field :type, :string
    field :description, :string

    has_many :submissions, Submission

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
