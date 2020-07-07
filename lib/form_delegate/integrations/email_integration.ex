defmodule FormDelegate.Integrations.EmailIntegration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.{EmailIntegration, EmailIntegrationRecipient, Integration}

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "form_integrations" do
    field :enabled, :boolean, null: false

    field :email_api_key, :string
    field :email_from_address, :string

    belongs_to :form, Form, type: Ecto.UUID
    belongs_to :integration, Integration

    has_many :email_integration_recipients, EmailIntegrationRecipient,
      foreign_key: :form_integration_id

    timestamps()
  end

  @doc false
  def changeset(%EmailIntegration{} = email_integration, attrs) do
    email_integration
    |> cast(attrs, [
      :email_api_key,
      :email_from_address,
      :enabled,
      :form_id,
      :integration_id
    ])
    |> cast_assoc(:email_integration_recipients)
    |> assoc_constraint(:form)
    |> assoc_constraint(:integration)
  end
end
