defmodule FormDelegate.Integrations.EmailIntegrationRecipient do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Integrations.{EmailIntegrationRecipient, EmailIntegration}

  schema "email_integration_recipients" do
    field :email, :string
    field :name, :string
    field :type, :string, default: "to"

    belongs_to :email_integration, EmailIntegration,
      foreign_key: :form_integration_id,
      type: Ecto.UUID
  end

  @doc false
  # @TODO: Require at least one recipient designated with "to" type
  def changeset(%EmailIntegrationRecipient{} = recipient, attrs) do
    recipient
    |> cast(attrs, [
      :email,
      :name,
      :type,
      :form_integration_id
    ])
    |> validate_required([:email, :type])
    |> assoc_constraint(:email_integration)
  end
end
