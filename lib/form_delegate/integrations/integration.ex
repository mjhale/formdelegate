defmodule FormDelegate.Integrations.Integration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Forms
  alias FormDelegate.Integrations.Integration

  schema "integrations" do
    field :type, :string

    has_many :form_integrations, Forms.Integration
    has_many :forms, through: [:form_integrations, :form]

    timestamps()
  end

  @doc false
  def changeset(%Integration{} = integration, attrs) do
    integration
    |> cast(attrs, [:type])
    |> validate_required([:type])
  end
end
