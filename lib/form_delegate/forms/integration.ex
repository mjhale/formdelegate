defmodule FormDelegate.Forms.Integration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.{Forms, Forms.Form}
  alias FormDelegate.Integrations

  schema "forms_integrations" do
    field :enabled, :boolean, default: false

    embeds_one :settings, Integrations.Settings, on_replace: :delete
    belongs_to :form, Form, type: Ecto.UUID
    belongs_to :integration, Integrations.Integration

    timestamps()
  end

  def changeset(%Forms.Integration{} = integration, attrs) do
    integration
    |> cast(attrs, [:enabled, :form_id, :integration_id])
    |> cast_embed(:settings)
    |> assoc_constraint(:form)
    |> assoc_constraint(:integration)
    |> validate_required([:integration_id])
  end
end
