defmodule FormDelegate.FormIntegration do
  use FormDelegateWeb, :model

  schema "forms_integrations" do
    field :enabled, :boolean, default: false

    embeds_one :settings, FormDelegate.Settings, on_replace: :delete
    belongs_to :form, FormDelegate.Form, type: Ecto.UUID
    belongs_to :integration, FormDelegate.Integration

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:enabled, :form_id, :integration_id])
    |> cast_embed(:settings)
    |> assoc_constraint(:form)
    |> assoc_constraint(:integration)
    |> validate_required([:integration_id])
  end
end
