defmodule FormDelegate.Settings do
  use FormDelegate.Web, :model

  embedded_schema do
    field :api_key, :string
    field :email, :string
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:api_key, :email])
    |> validate_required([])
  end
end
