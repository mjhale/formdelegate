defmodule FormDelegate.Integrations.FormIntegration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.{EmailIntegrationRecipient, FormIntegration, Integration}

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "form_integrations" do
    field :enabled, :boolean, null: false, default: false

    field :email_api_key, :string
    field :email_from_address, :string

    has_many :email_integration_recipients, EmailIntegrationRecipient,
      foreign_key: :form_integration_id

    belongs_to :form, Form, type: Ecto.UUID
    belongs_to :integration, Integration

    timestamps()
  end

  def changeset(%FormIntegration{} = integration, attrs) do
    integration
    |> cast(attrs, [:enabled, :form_id, :integration_id])
    |> assoc_constraint(:form)
    |> assoc_constraint(:integration)
  end
end
