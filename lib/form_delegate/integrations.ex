defmodule FormDelegate.Integrations do
  import Ecto.Query, warn: false

  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Integrations.EmailProviders.{Postmark, SMTP, SendGrid}
  alias FormDelegate.Repo

  @provider_modules %{
    smtp: SMTP,
    postmark: Postmark,
    sendgrid: SendGrid
  }

  @verification_event [:form_delegate, :email_integration, :verification]

  @type verification_error ::
          {:unsupported_provider, atom() | nil}
          | {:verification_failed, String.t(), String.t()}
          | {:verification_failed, String.t(), String.t(), Ecto.Changeset.t()}

  @spec verification_error_type(verification_error()) :: String.t()
  def verification_error_type({:unsupported_provider, _provider}),
    do: "UNSUPPORTED_EMAIL_PROVIDER"

  def verification_error_type({:verification_failed, _reason, failure_code}),
    do: "EMAIL_PROVIDER_VERIFICATION_FAILED_#{failure_code}"

  def verification_error_type({:verification_failed, _reason, failure_code, _changeset}),
    do: "EMAIL_PROVIDER_VERIFICATION_FAILED_#{failure_code}"

  @spec get_form_email_integration(Ecto.UUID.t(), Ecto.UUID.t()) :: %EmailIntegration{} | nil
  def get_form_email_integration(form_id, email_integration_id)
      when is_binary(form_id) and is_binary(email_integration_id) do
    Repo.one(
      from integration in EmailIntegration,
        where: integration.id == ^email_integration_id and integration.form_id == ^form_id,
        preload: [:email_integration_recipients]
    )
  end

  @spec verify_email_integration_provider(Ecto.UUID.t() | %EmailIntegration{}) ::
          {:ok, %EmailIntegration{}} | {:error, verification_error() | Ecto.Changeset.t()}
  def verify_email_integration_provider(email_integration_id)
      when is_binary(email_integration_id) do
    email_integration =
      Repo.one!(
        from integration in EmailIntegration,
          where: integration.id == ^email_integration_id
      )

    verify_email_integration_provider(email_integration)
  end

  def verify_email_integration_provider(%EmailIntegration{} = email_integration) do
    verify_email_integration_provider(email_integration, @provider_modules)
  end

  @spec verify_email_integration_provider(%EmailIntegration{}, map()) ::
          {:ok, %EmailIntegration{}} | {:error, verification_error() | Ecto.Changeset.t()}
  def verify_email_integration_provider(%EmailIntegration{} = email_integration, provider_modules)
      when is_map(provider_modules) do
    started_at = System.monotonic_time()

    result =
      case Map.get(provider_modules, email_integration.email_provider) do
        nil ->
          {:error, {:unsupported_provider, email_integration.email_provider}}

        provider_module ->
          case provider_module.verify_credentials(
                 email_integration.email_provider_config || %{},
                 email_integration.email_provider_secrets || %{}
               ) do
            :ok ->
              set_status(email_integration, :verified, DateTime.utc_now())

            {:error, reason} ->
              failure_code = verification_failure_code(reason)

              case set_status(email_integration, :invalid, nil) do
                {:ok, _updated_integration} ->
                  {:error, {:verification_failed, reason, failure_code}}

                {:error, changeset} ->
                  {:error, {:verification_failed, reason, failure_code, changeset}}
              end
          end
      end

    emit_verification_event(email_integration, started_at, result)

    result
  end

  defp set_status(%EmailIntegration{} = email_integration, status, last_verified_at) do
    email_integration
    |> EmailIntegration.verification_changeset(%{
      email_provider_status: status,
      email_provider_last_verified_at: last_verified_at
    })
    |> Repo.update()
  end

  defp verification_failure_code(reason) when is_binary(reason) do
    cond do
      String.contains?(reason, "invalid") and String.contains?(reason, "credentials") ->
        "INVALID_CREDENTIALS"

      String.contains?(reason, "connection failed") ->
        "CONNECTION_FAILED"

      String.contains?(reason, "missing required value") or
          String.contains?(reason, "configuration") ->
        "INVALID_CONFIGURATION"

      String.contains?(reason, "smtp server does not support AUTH") ->
        "UNSUPPORTED_AUTH_METHOD"

      true ->
        "UNKNOWN"
    end
  end

  defp emit_verification_event(email_integration, started_at, result) do
    duration_ms =
      System.convert_time_unit(System.monotonic_time() - started_at, :native, :millisecond)

    {status, failure_code} =
      case result do
        {:ok, _integration} -> {:verified, nil}
        {:error, {:unsupported_provider, _provider}} -> {:failed, "UNSUPPORTED_EMAIL_PROVIDER"}
        {:error, {:verification_failed, _reason, code}} -> {:failed, code}
        {:error, {:verification_failed, _reason, code, _changeset}} -> {:failed, code}
      end

    :telemetry.execute(
      @verification_event,
      %{duration_ms: duration_ms},
      %{
        integration_id: email_integration.id,
        form_id: email_integration.form_id,
        provider: email_integration.email_provider,
        status: status,
        failure_code: failure_code
      }
    )
  end
end
