defmodule FormDelegate.Integrations.WebhookIntegration do
  @moduledoc "Webhook configuration with a write-only signing secret."
  use Ecto.Schema
  import Ecto.Changeset
  alias FormDelegate.Integrations.Webhooks.Target

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "form_integrations" do
    field :enabled, :boolean, default: false
    field :url, :string, source: :webhook_url
    field :signing_secret, :string, source: :webhook_signing_secret, redact: true
    field :integration_type, Ecto.Enum, values: [:email, :zapier, :ifttt, :webhook]
    belongs_to :form, FormDelegate.Forms.Form, type: Ecto.UUID
    timestamps()
  end

  def changeset(integration, attrs) do
    integration
    |> cast(attrs, [:enabled, :url, :signing_secret])
    |> validate_required([:enabled, :url, :signing_secret])
    |> validate_length(:url, max: 2048)
    |> validate_length(:signing_secret, min: 32, max: 1024, count: :codepoints)
    |> validate_destination()
    |> put_change(:integration_type, :webhook)
    |> assoc_constraint(:form)
  end

  defp validate_destination(changeset) do
    # Disabling must remain possible during a DNS outage. Enabled endpoints are
    # checked on every save, including when an unchanged URL is enabled.
    result =
      if get_field(changeset, :enabled),
        do: Target.validate(get_field(changeset, :url)),
        else: Target.parse(get_field(changeset, :url))

    case result do
      {:ok, _} ->
        changeset

      {:error, _} ->
        add_error(
          changeset,
          :url,
          "must be an HTTPS URL on port 443 with a public DNS hostname and public addresses"
        )
    end
  end
end
