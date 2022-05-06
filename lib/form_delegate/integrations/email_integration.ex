defmodule FormDelegate.Integrations.EmailIntegration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.{EmailIntegration, EmailIntegrationRecipient}

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "form_integrations" do
    field :enabled, :boolean

    field :email_api_key, :string
    field :email_from_address, :string

    field :integration_type, Ecto.Enum, values: [:email, :zapier, :ifttt]

    belongs_to :form, Form, type: Ecto.UUID

    has_many :email_integration_recipients, EmailIntegrationRecipient,
      foreign_key: :form_integration_id,
      on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(%EmailIntegration{} = email_integration, attrs) do
    email_integration
    |> cast(attrs, [
      :email_api_key,
      :email_from_address,
      :enabled,
      :form_id
    ])
    |> cast_assoc(:email_integration_recipients)
    |> validate_required([:enabled])
    |> put_change(:integration_type, :email)
    |> assoc_constraint(:form)
  end
end
