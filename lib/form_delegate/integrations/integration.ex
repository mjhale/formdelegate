defmodule FormDelegate.Integrations.Integration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Integrations.{FormIntegration, Integration}

  @timestamps_opts [type: :utc_datetime_usec]

  schema "integrations" do
    field :name, :string
    field :type_code, :string, null: false

    has_many :form_integrations, FormIntegration
    has_many :forms, through: [:form_integrations, :form]

    timestamps()
  end

  @doc false
  def changeset(%Integration{} = integration, attrs) do
    integration
    |> cast(attrs, [:name, :type_code])
    |> validate_required([:name, :type_code])
  end
end
