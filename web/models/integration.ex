defmodule FormDelegate.Integration do
  use FormDelegate.Web, :model

  alias FormDelegate.FormIntegration

  schema "integrations" do
    field :type, :string

    has_many :form_integrations, FormIntegration
    has_many :forms, through: [:form_integrations, :form]

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:type])
    |> validate_required([:type])
  end
end
