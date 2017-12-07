defmodule FormDelegate.Integrations.Settings do
  use Ecto.Schema
  import Ecto.Changeset
  alias FormDelegate.Integrations.Settings

  embedded_schema do
    field :api_key, :string
    field :email, :string
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(%Settings{} = settings, attrs) do
    settings
    |> cast(attrs, [:api_key, :email])
  end
end
