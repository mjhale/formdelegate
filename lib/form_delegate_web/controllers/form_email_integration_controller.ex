defmodule FormDelegateWeb.FormEmailIntegrationController do
  use FormDelegateWeb, :controller

  alias FormDelegate.{Forms, Integrations}
  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(%Plug.Conn{assigns: %{current_user: current_user}} = conn, _opts) do
    args = [conn, conn.params, current_user]
    apply(__MODULE__, action_name(conn), args)
  end

  def verify(conn, %{"form_id" => form_id, "id" => email_integration_id}, current_user) do
    with %Form{} = form <- Forms.get_form!(form_id),
         :ok <- Authorizer.authorize(:update_form, current_user, form),
         %EmailIntegration{} = email_integration <-
           Integrations.get_form_email_integration(form.id, email_integration_id),
         {:ok, %EmailIntegration{} = email_integration} <-
           Integrations.verify_email_integration_provider(email_integration) do
      render(conn, "show.json", email_integration: email_integration)
    else
      {:error, :forbidden} ->
        {:error, :forbidden}

      nil ->
        {:error, :not_found}

      {:error, verification_error} ->
        {:error, :bad_request, %{type: Integrations.verification_error_type(verification_error)}}
    end
  end
end
