defmodule FormDelegate.Integrations.FormIntegration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.{EmailIntegrationRecipient, FormIntegration}

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "form_integrations" do
    field :enabled, :boolean, null: false, default: false

    field :email_api_key, :string
    field :email_from_address, :string

    has_many :email_integration_recipients, EmailIntegrationRecipient,
      foreign_key: :form_integration_id

    field :integration_type, Ecto.Enum, values: [:email, :zapier, :ifttt], null: false
    belongs_to :form, Form, type: Ecto.UUID

    timestamps()
  end

  def changeset(%FormIntegration{} = form_integration, attrs) do
    form_integration
    |> cast(attrs, [:enabled, :form_id, :integration_type])
    |> validate_required([:enabled, :form_id, :integration_type])
    |> assoc_constraint(:form)
  end
end
