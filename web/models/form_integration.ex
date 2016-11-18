defmodule FormDelegate.FormIntegration do
  use FormDelegate.Web, :model

  schema "forms_integrations" do
    field :enabled, :boolean, default: false
    embeds_one :settings, FormDelegate.Settings

    belongs_to :form, FormDelegate.Form, type: Ecto.UUID
    belongs_to :integration, FormDelegate.Integration

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:form_id, :integration_id, :settings, :enabled])
    |> validate_required([:form_id, :integration_id])
  end
end
