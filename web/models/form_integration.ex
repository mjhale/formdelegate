defmodule FormDelegate.FormIntegration do
  use FormDelegate.Web, :model

  @primary_key false
  schema "forms_integrations" do
    belongs_to :form, FormDelegate.Form
    belongs_to :integration, FormDelegate.Integration

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:form_id, :integration_id])
    |> validate_required([:form_id, :integration_id])
  end
end
