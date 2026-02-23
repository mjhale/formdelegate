defmodule FormDelegate.Integrations.EmailIntegration do
  use Ecto.Schema
  import Ecto.Changeset

  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.{EmailIntegration, EmailIntegrationRecipient}

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  schema "form_integrations" do
    field :enabled, :boolean

    field :email_provider, Ecto.Enum, values: [:smtp, :postmark, :sendgrid]
    field :email_provider_config, :map
    field :email_provider_secrets, :map
    field :verify_provider, :boolean, virtual: true, default: false

    field :email_provider_status, Ecto.Enum,
      values: [:unconfigured, :pending_verification, :verified, :invalid],
      default: :unconfigured

    field :email_provider_last_verified_at, :utc_datetime_usec

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
      :enabled,
      :form_id,
      :email_provider,
      :email_provider_config,
      :email_provider_secrets,
      :email_provider_status,
      :email_provider_last_verified_at,
      :verify_provider
    ])
    |> cast_assoc(:email_integration_recipients)
    |> validate_required([:enabled])
    |> validate_provider_requirements_when_enabled()
    |> put_change(:integration_type, :email)
    |> assoc_constraint(:form)
  end

  @doc false
  def verification_changeset(%EmailIntegration{} = email_integration, attrs) do
    email_integration
    |> cast(attrs, [:email_provider_status, :email_provider_last_verified_at])
    |> validate_required([:email_provider_status])
  end

  defp validate_provider_requirements_when_enabled(changeset) do
    if get_field(changeset, :enabled) do
      changeset
      |> validate_required([
        :email_provider,
        :email_provider_config,
        :email_provider_secrets,
        :email_provider_status
      ])
      |> validate_provider_config_keys()
      |> validate_provider_secret_keys()
      |> validate_to_recipient_present()
      |> validate_inclusion(:email_provider_status, [:verified, :pending_verification])
      |> validate_pending_verification_requested()
      |> prevent_direct_verified_status_change()
    else
      changeset
    end
  end

  defp validate_pending_verification_requested(changeset) do
    status = get_field(changeset, :email_provider_status)
    verify_provider = get_field(changeset, :verify_provider)

    if status == :pending_verification and verify_provider != true do
      add_error(
        changeset,
        :verify_provider,
        "must be true when email_provider_status is pending_verification"
      )
    else
      changeset
    end
  end

  defp prevent_direct_verified_status_change(changeset) do
    case get_change(changeset, :email_provider_status) do
      :verified ->
        add_error(changeset, :email_provider_status, "cannot be set directly")

      _ ->
        changeset
    end
  end

  defp validate_provider_config_keys(changeset) do
    case {get_field(changeset, :email_provider), get_field(changeset, :email_provider_config)} do
      {provider, %{} = config} ->
        config_keys = map_keys_as_strings(config)

        missing_keys =
          provider
          |> required_config_keys()
          |> Enum.reject(&MapSet.member?(config_keys, &1))

        if missing_keys == [] do
          changeset
        else
          add_error(
            changeset,
            :email_provider_config,
            "missing required keys: #{Enum.join(missing_keys, ", ")}"
          )
        end

      _ ->
        changeset
    end
  end

  defp validate_provider_secret_keys(changeset) do
    case {get_field(changeset, :email_provider), get_field(changeset, :email_provider_secrets)} do
      {provider, %{} = secrets} ->
        secret_keys = map_keys_as_strings(secrets)

        missing_keys =
          provider
          |> required_secret_keys()
          |> Enum.reject(&MapSet.member?(secret_keys, &1))

        if missing_keys == [] do
          changeset
        else
          add_error(
            changeset,
            :email_provider_secrets,
            "missing required keys: #{Enum.join(missing_keys, ", ")}"
          )
        end

      _ ->
        changeset
    end
  end

  defp validate_to_recipient_present(changeset) do
    recipients = get_field(changeset, :email_integration_recipients, [])

    has_to_recipient? =
      Enum.any?(recipients, fn recipient ->
        recipient_type =
          case recipient do
            %Ecto.Changeset{} -> get_field(recipient, :type)
            _ -> Map.get(recipient, :type)
          end

        recipient_type == "to"
      end)

    if has_to_recipient? do
      changeset
    else
      add_error(
        changeset,
        :email_integration_recipients,
        "must include at least one 'to' recipient"
      )
    end
  end

  defp required_config_keys(:smtp), do: ["host", "port", "username", "from_address"]
  defp required_config_keys(:postmark), do: ["from_address", "message_stream"]
  defp required_config_keys(:sendgrid), do: ["from_address"]
  defp required_config_keys(_provider), do: []

  defp required_secret_keys(:smtp), do: ["password"]
  defp required_secret_keys(:postmark), do: ["server_token"]
  defp required_secret_keys(:sendgrid), do: ["api_key"]
  defp required_secret_keys(_provider), do: []

  defp map_keys_as_strings(map) do
    map
    |> Map.keys()
    |> Enum.map(&to_string/1)
    |> MapSet.new()
  end
end
