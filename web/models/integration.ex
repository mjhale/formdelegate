defmodule FormDelegate.Integration do
  use FormDelegate.Web, :model

  schema "integrations" do
    field :name, :string
    field :enabled, :boolean, default: false

    many_to_many :forms, FormDelegate.Form, join_through: FormDelegate.FormIntegration

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name, :enabled])
    |> validate_required([:name, :enabled])
  end
end
